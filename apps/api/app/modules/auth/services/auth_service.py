import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.config import get_settings
from app.core.security.jwt import create_access_token, create_refresh_token, decode_refresh_token
from app.core.security.password import hash_password, verify_password
from app.core.exceptions import (
    UnauthorizedError,
    ConflictError,
    NotFoundError,
    BusinessRuleError,
)
from app.modules.users.models.user import User, RefreshToken
from app.modules.rbac.models.role import Role, UserRole, RoleEnum
from app.modules.auth.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    AuthResponse,
    TokenResponse,
    UserProfile,
)

settings = get_settings()


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest, user_agent: str | None = None, ip: str | None = None) -> AuthResponse:
        # Check duplicates
        existing_email = await self.db.execute(
            select(User).where(User.email == data.email)
        )
        if existing_email.scalar_one_or_none():
            raise ConflictError("Email already registered")

        existing_username = await self.db.execute(
            select(User).where(User.username == data.username)
        )
        if existing_username.scalar_one_or_none():
            raise ConflictError("Username already taken")

        # Create user
        user = User(
            email=data.email,
            username=data.username,
            password_hash=hash_password(data.password),
            display_name=data.display_name,
        )
        self.db.add(user)
        await self.db.flush()

        # Assign default role
        result = await self.db.execute(
            select(Role).where(Role.name == RoleEnum.USER.value)
        )
        default_role = result.scalar_one_or_none()
        if default_role:
            self.db.add(UserRole(user_id=user.id, role_id=default_role.id))
            await self.db.flush()

        # Load relationships
        await self.db.refresh(user, attribute_names=["roles", "subscription"])

        tokens = await self._create_token_pair(user.id, user_agent, ip)
        return AuthResponse(
            user=UserProfile.model_validate(user),
            tokens=tokens,
        )

    async def login(self, data: LoginRequest, user_agent: str | None = None, ip: str | None = None) -> AuthResponse:
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.roles).selectinload(UserRole.role))
            .options(selectinload(User.subscription))
            .where(User.email == data.email)
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedError("Account is deactivated")

        if user.is_banned:
            raise BusinessRuleError(f"Account banned: {user.ban_reason or 'No reason provided'}")

        tokens = await self._create_token_pair(user.id, user_agent, ip)
        return AuthResponse(
            user=UserProfile.model_validate(user),
            tokens=tokens,
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        payload = decode_refresh_token(refresh_token)
        user_id = payload.get("sub")

        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.user_id == uuid.UUID(user_id),
                RefreshToken.revoked == False,  # noqa: E712
                RefreshToken.expires_at > datetime.now(timezone.utc).replace(tzinfo=None),
            )
        )
        stored = result.scalar_one_or_none()
        if not stored:
            raise UnauthorizedError("Invalid or expired refresh token")

        # Revoke old, create new
        stored.revoked = True
        return await self._create_token_pair(uuid.UUID(user_id))

    async def logout(self, refresh_token: str) -> None:
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        stored = result.scalar_one_or_none()
        if stored:
            stored.revoked = True
            await self.db.flush()

    async def logout_all(self, user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked == False,  # noqa: E712
            )
        )
        tokens = result.scalars().all()
        for t in tokens:
            t.revoked = True
        await self.db.flush()
        return len(tokens)

    async def get_profile(self, user_id: uuid.UUID) -> UserProfile:
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.roles).selectinload(UserRole.role))
            .options(selectinload(User.subscription))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User")
        return UserProfile.model_validate(user)

    async def update_profile(self, user: User, data: UpdateProfileRequest) -> UserProfile:
        if data.display_name is not None:
            user.display_name = data.display_name
        if data.avatar_url is not None:
            user.avatar_url = data.avatar_url
        if data.bio is not None:
            user.bio = data.bio
        await self.db.flush()
        await self.db.refresh(user, attribute_names=["roles", "subscription"])
        return UserProfile.model_validate(user)

    async def change_password(self, user: User, data: ChangePasswordRequest) -> None:
        if not verify_password(data.current_password, user.password_hash):
            raise UnauthorizedError("Current password is incorrect")
        user.password_hash = hash_password(data.new_password)
        # Revoke all refresh tokens
        await self.logout_all(user.id)
        await self.db.flush()

    async def _create_token_pair(
        self,
        user_id: uuid.UUID,
        user_agent: str | None = None,
        ip: str | None = None,
    ) -> TokenResponse:
        access = create_access_token(str(user_id))
        refresh = create_refresh_token(str(user_id))

        token_hash = hashlib.sha256(refresh.encode()).hexdigest()
        self.db.add(RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=(datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)).replace(tzinfo=None),
            user_agent=user_agent,
            ip_address=ip,
        ))
        await self.db.flush()

        return TokenResponse(
            access_token=access,
            refresh_token=refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
