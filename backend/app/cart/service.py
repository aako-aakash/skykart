"""
SKYKART — Cart Service
───────────────────────
Cart is per-user, persisted in DB.

Key behaviours:
  - Adding an already-carted product increments quantity (upsert)
  - Updating quantity to 0 removes the item
  - Cart response computes subtotal per item and grand total
  - Stock availability is checked on add/update (soft check — hard check
    happens at checkout)
"""

from uuid import UUID
from decimal import Decimal
from typing import List

from sqlalchemy.orm import Session

from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartResponse, CartItemResponse
from app.core.exceptions import NotFoundException, BadRequestException


class CartService:

    @staticmethod
    def get_cart(db: Session, user: User) -> CartResponse:
        """Return all cart items for a user with computed totals."""
        items = (
            db.query(CartItem)
            .filter(CartItem.user_id == user.id)
            .all()
        )
        response_items = []
        total = Decimal("0.00")

        for item in items:
            if not item.product or not item.product.is_active:
                continue  # Skip deactivated products silently
            subtotal = item.product.price * item.quantity
            total += subtotal
            response_items.append(
                CartItemResponse(
                    id=item.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    product=item.product,
                    subtotal=subtotal,
                )
            )

        return CartResponse(
            items=response_items,
            item_count=len(response_items),
            total_amount=total,
        )

    @staticmethod
    def add_item(db: Session, user: User, data: CartItemAdd) -> CartResponse:
        """
        Add a product to cart or increment quantity if already present.
        Uses SQLAlchemy's merge-style logic (query then update or create).
        """
        product = db.query(Product).filter(
            Product.id == data.product_id,
            Product.is_active == True,
        ).first()

        if not product:
            raise NotFoundException("Product not found or unavailable.")

        existing = db.query(CartItem).filter(
            CartItem.user_id == user.id,
            CartItem.product_id == data.product_id,
        ).first()

        if existing:
            new_qty = existing.quantity + data.quantity
            if new_qty > product.stock_quantity:
                raise BadRequestException(
                    f"Only {product.stock_quantity} units available."
                )
            existing.quantity = new_qty
        else:
            if data.quantity > product.stock_quantity:
                raise BadRequestException(
                    f"Only {product.stock_quantity} units available."
                )
            cart_item = CartItem(
                user_id=user.id,
                product_id=data.product_id,
                quantity=data.quantity,
            )
            db.add(cart_item)

        db.commit()
        return CartService.get_cart(db, user)

    @staticmethod
    def update_item(
        db: Session, user: User, item_id: UUID, data: CartItemUpdate
    ) -> CartResponse:
        item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.user_id == user.id,
        ).first()

        if not item:
            raise NotFoundException("Cart item not found.")

        if data.quantity == 0:
            db.delete(item)
        else:
            if data.quantity > item.product.stock_quantity:
                raise BadRequestException(
                    f"Only {item.product.stock_quantity} units available."
                )
            item.quantity = data.quantity

        db.commit()
        return CartService.get_cart(db, user)

    @staticmethod
    def remove_item(db: Session, user: User, item_id: UUID) -> CartResponse:
        item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.user_id == user.id,
        ).first()

        if not item:
            raise NotFoundException("Cart item not found.")

        db.delete(item)
        db.commit()
        return CartService.get_cart(db, user)

    @staticmethod
    def clear_cart(db: Session, user: User) -> None:
        """Called after successful order placement."""
        db.query(CartItem).filter(CartItem.user_id == user.id).delete()
        db.commit()
