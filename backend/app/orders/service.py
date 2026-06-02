"""
SKYKART — Orders Service
─────────────────────────
Handles the complete checkout flow:
  1. Validate cart is not empty
  2. Validate delivery address belongs to user
  3. Snapshot product name/price into OrderItems (price-lock)
  4. Decrement stock for each item
  5. Create Order + OrderItems in a single transaction
  6. Clear the user's cart
  7. Create a pending Payment record

The entire operation is wrapped in a DB transaction — if anything fails,
everything rolls back. No partial orders, no orphaned payments.
"""

import math
from decimal import Decimal
from uuid import UUID
from typing import Optional

from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus, Address
from app.models.cart import CartItem
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.schemas.order import CheckoutRequest, OrderResponse, OrderListResponse
from app.products.service import ProductService
from app.cart.service import CartService
from app.core.exceptions import (
    BadRequestException,
    NotFoundException,
    ForbiddenException,
)
from app.models.user import User, UserRole


SHIPPING_THRESHOLD = Decimal("499.00")   # Free shipping above this
SHIPPING_CHARGE = Decimal("49.00")


class OrderService:

    @staticmethod
    def checkout(db: Session, user: User, data: CheckoutRequest) -> Order:
        """
        Convert the user's cart into a confirmed Order.
        Entire operation is atomic.
        """
        # 1. Load cart items
        cart_items = (
            db.query(CartItem)
            .filter(CartItem.user_id == user.id)
            .all()
        )
        if not cart_items:
            raise BadRequestException("Your cart is empty.")

        # 2. Validate address
        address = db.query(Address).filter(
            Address.id == data.address_id,
            Address.user_id == user.id,
        ).first()
        if not address:
            raise NotFoundException("Delivery address not found.")

        # 3. Calculate totals & validate stock
        subtotal = Decimal("0.00")
        order_items_data = []

        for cart_item in cart_items:
            product = cart_item.product
            if not product or not product.is_active:
                raise BadRequestException(
                    f"Product '{product.name if product else 'unknown'}' "
                    f"is no longer available."
                )
            if product.stock_quantity < cart_item.quantity:
                raise BadRequestException(
                    f"Insufficient stock for '{product.name}'. "
                    f"Only {product.stock_quantity} left."
                )
            item_subtotal = product.price * cart_item.quantity
            subtotal += item_subtotal
            order_items_data.append({
                "product": product,
                "quantity": cart_item.quantity,
                "unit_price": product.price,
                "subtotal": item_subtotal,
            })

        shipping_charge = (
            Decimal("0.00") if subtotal >= SHIPPING_THRESHOLD else SHIPPING_CHARGE
        )
        total_amount = subtotal + shipping_charge

        # 4. Create Order
        order = Order(
            user_id=user.id,
            address_id=address.id,
            status=OrderStatus.PENDING,
            subtotal=subtotal,
            discount_amount=Decimal("0.00"),
            shipping_charge=shipping_charge,
            total_amount=total_amount,
            coupon_code=data.coupon_code,
            notes=data.notes,
        )
        db.add(order)
        db.flush()  # Get order.id without committing yet

        # 5. Create OrderItems + decrement stock
        for item_data in order_items_data:
            product = item_data["product"]
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,          # Price snapshot
                product_image=product.thumbnail_url, # Image snapshot
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],  # Price snapshot
                subtotal=item_data["subtotal"],
            )
            db.add(order_item)
            product.stock_quantity -= item_data["quantity"]  # Decrement stock

        # 6. Create pending Payment record
        payment = Payment(
            order_id=order.id,
            amount=total_amount,
            status=PaymentStatus.PENDING,
            method=PaymentMethod.RAZORPAY,
        )
        db.add(payment)

        # 7. Clear cart
        db.query(CartItem).filter(CartItem.user_id == user.id).delete()

        # Commit everything atomically
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_user_orders(
        db: Session,
        user: User,
        page: int = 1,
        per_page: int = 10,
    ) -> OrderListResponse:
        q = db.query(Order).filter(Order.user_id == user.id).order_by(
            Order.created_at.desc()
        )
        total = q.count()
        items = q.offset((page - 1) * per_page).limit(per_page).all()
        return OrderListResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            pages=math.ceil(total / per_page) if total else 0,
        )

    @staticmethod
    def get_order_detail(db: Session, user: User, order_id: UUID) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise NotFoundException("Order not found.")
        # Users can only see their own orders; admins can see all
        if user.role != UserRole.ADMIN and order.user_id != user.id:
            raise ForbiddenException("Access denied.")
        return order

    @staticmethod
    def update_status(
        db: Session, order_id: UUID, new_status: OrderStatus
    ) -> Order:
        """Admin-only: update order lifecycle status."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise NotFoundException("Order not found.")
        order.status = new_status
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def cancel_order(db: Session, user: User, order_id: UUID) -> Order:
        """User can cancel only PENDING orders."""
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user.id,
        ).first()
        if not order:
            raise NotFoundException("Order not found.")
        if order.status not in (OrderStatus.PENDING, OrderStatus.CONFIRMED):
            raise BadRequestException(
                "Only pending or confirmed orders can be cancelled."
            )
        # Restore stock
        for item in order.items:
            item.product.stock_quantity += item.quantity

        order.status = OrderStatus.CANCELLED
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def admin_list_orders(
        db: Session,
        page: int = 1,
        per_page: int = 20,
        status: Optional[OrderStatus] = None,
    ) -> OrderListResponse:
        q = db.query(Order).order_by(Order.created_at.desc())
        if status:
            q = q.filter(Order.status == status)
        total = q.count()
        items = q.offset((page - 1) * per_page).limit(per_page).all()
        return OrderListResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            pages=math.ceil(total / per_page) if total else 0,
        )
