import uuid
import enum
from sqlalchemy import String, ForeignKey, Enum as SAEnum, Table, Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.base import Base


class RoleEnum(str, enum.Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"
    SYSTEM = "system"


class PermissionEnum(str, enum.Enum):
    # Strategies
    STRATEGY_CREATE = "strategy:create"
    STRATEGY_READ = "strategy:read"
    STRATEGY_UPDATE = "strategy:update"
    STRATEGY_DELETE = "strategy:delete"
    STRATEGY_PUBLISH = "strategy:publish"

    # Backtests
    BACKTEST_CREATE = "backtest:create"
    BACKTEST_READ = "backtest:read"
    BACKTEST_CANCEL = "backtest:cancel"

    # Tournaments
    TOURNAMENT_JOIN = "tournament:join"
    TOURNAMENT_CREATE = "tournament:create"
    TOURNAMENT_MANAGE = "tournament:manage"

    # Marketplace
    MARKETPLACE_BUY = "marketplace:buy"
    MARKETPLACE_SELL = "marketplace:sell"

    # Admin
    ADMIN_USERS = "admin:users"
    ADMIN_STRATEGIES = "admin:strategies"
    ADMIN_TOURNAMENTS = "admin:tournaments"
    ADMIN_BILLING = "admin:billing"
    ADMIN_ANALYTICS = "admin:analytics"


# Role → Permission mapping table
role_permissions_table = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class Role(Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(255))
    permissions = relationship("Permission", secondary=role_permissions_table, lazy="selectin")


class Permission(Base):
    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(255))


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )
    user = relationship("User", back_populates="roles")
    role = relationship("Role", lazy="selectin")
