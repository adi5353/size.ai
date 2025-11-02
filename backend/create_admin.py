"""
Script to create an admin user in the database.
Run this once to set up your admin account.
"""
import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid

# Add backend directory to path
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

from dotenv import load_dotenv
load_dotenv(ROOT_DIR / '.env')

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    """Create admin user in database."""
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Admin credentials
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@sizeai.com')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'Admin123!@#')
    admin_name = 'System Administrator'
    
    print(f"Creating admin user: {admin_email}")
    
    # Check if admin already exists
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print(f"⚠️  Admin user already exists: {admin_email}")
        
        # Update to admin role if not already
        if existing.get('role') != 'admin':
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"role": "admin"}}
            )
            print(f"✅ Updated user to admin role")
        else:
            print(f"✅ User already has admin role")
        
        client.close()
        return
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": admin_email,
        "name": admin_name,
        "role": "admin",
        "hashed_password": pwd_context.hash(admin_password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_user)
    
    print(f"✅ Admin user created successfully!")
    print(f"   Email: {admin_email}")
    print(f"   Password: {admin_password}")
    print(f"\n⚠️  IMPORTANT: Change the admin password after first login!")
    print(f"   Access admin panel at: /admin-login")
    
    client.close()

if __name__ == "__main__":
    print("=" * 60)
    print("size.ai Admin User Setup")
    print("=" * 60)
    asyncio.run(create_admin_user())
    print("=" * 60)
