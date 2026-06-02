"""
SKYKART — Cart Model
──────────────────────
Design decisions:
  - No separate Cart table — cart IS the collection of CartItems per user.
    Simpler queries, no extra join needed.
  - Cart is user-scoped: guest carts are handled on the frontend (localStorage)
    and merged into the DB cart on login.
  - Unique constraint on (user_id, product_id) prevents duplicate rows —
    adding the same product just increments quantity via upsert logic.
"""

from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class CartItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "cart_items"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    quantity = Column(Integer, default=1, nullable=False)

    # Prevent duplicate rows for same user+product
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_cart_user_product"),
    )

    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")

    def __repr__(self):
        return f"<CartItem user={self.user_id} product={self.product_id} qty={self.quantity}>"
