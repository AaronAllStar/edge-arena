"""Seed script for development data."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "apps", "api"))

from app.core.database import async_session_factory
from app.modules.auth.models import User
from app.core.security import hash_password


async def seed():
    async with async_session_factory() as db:
        # Create test user
        test_user = User(
            email="test@edgearena.com",
            username="testtrader",
            password_hash=hash_password("test1234"),
            display_name="Test Trader",
            plan="premium",
            rating=1500,
            total_wins=25,
            total_losses=10,
        )
        db.add(test_user)
        await db.commit()
        print(f"Created test user: {test_user.username} (id: {test_user.id})")
        print("Email: test@edgearena.com | Password: test1234")


if __name__ == "__main__":
    asyncio.run(seed())
