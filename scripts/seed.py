"""Seed development data."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

from app.core.db.session import async_session_factory
from app.core.security.password import hash_password
from app.modules.users.models.user import User
from app.modules.rbac.services.role_service import RoleService


async def seed():
    async with async_session_factory() as db:
        # Seed roles
        role_svc = RoleService(db)
        await role_svc.seed_defaults()

        # Test users
        users = [
            ("admin@edgearena.com", "admin", "Admin", True),
            ("trader@edgearena.com", "protrader", "Pro Trader", False),
            ("demo@edgearena.com", "demouser", "Demo User", False),
        ]

        for email, username, display, is_admin in users:
            existing = await db.execute(
                __import__("sqlalchemy").select(User).where(User.email == email)
            )
            if existing.scalar_one_or_none():
                continue

            user = User(
                email=email,
                username=username,
                password_hash=hash_password("test1234"),
                display_name=display,
                plan="premium" if is_admin else "free",
                rating=1500 if is_admin else 1200,
                total_wins=30 if is_admin else 0,
                total_losses=10 if is_admin else 0,
            )
            db.add(user)
            await db.flush()

            if is_admin:
                await role_svc.assign_role(user.id, "admin")
            await role_svc.assign_role(user.id, "user")

        await db.commit()
        print("Seed complete. Users:")
        for email, username, _, _ in users:
            print(f"  {email} / test1234  ({username})")


if __name__ == "__main__":
    asyncio.run(seed())
