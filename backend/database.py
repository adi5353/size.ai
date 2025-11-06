"""
Database connection, indexing, and optimization module for size.ai
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages MongoDB connection with connection pooling and optimization."""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        
    async def connect(self):
        """Initialize MongoDB connection with optimized settings."""
        mongo_url = os.environ['MONGO_URL']
        db_name = os.environ['DB_NAME']
        
        # Connection pooling configuration
        self.client = AsyncIOMotorClient(
            mongo_url,
            maxPoolSize=50,  # Maximum connections in pool
            minPoolSize=10,  # Minimum connections to maintain
            maxIdleTimeMS=45000,  # Close idle connections after 45s
            waitQueueTimeoutMS=5000,  # Wait 5s for connection from pool
            serverSelectionTimeoutMS=5000,  # 5s timeout for server selection
            connectTimeoutMS=10000,  # 10s connection timeout
            socketTimeoutMS=45000,  # 45s socket timeout
        )
        
        self.db = self.client[db_name]
        logger.info(f"Connected to MongoDB database: {db_name}")
        
        # Create indexes
        await self.create_indexes()
        
        # Setup schema validation
        await self.setup_schema_validation()
        
        logger.info("Database initialization complete")
        
    async def create_indexes(self):
        """Create optimized indexes for all collections."""
        try:
            # Users collection indexes
            await self.db.users.create_index([("email", ASCENDING)], unique=True, name="idx_users_email")
            await self.db.users.create_index([("id", ASCENDING)], unique=True, name="idx_users_id")
            await self.db.users.create_index([("created_at", DESCENDING)], name="idx_users_created_at")
            await self.db.users.create_index([("role", ASCENDING)], name="idx_users_role")
            
            # User activities collection indexes
            await self.db.user_activities.create_index(
                [("user_id", ASCENDING), ("timestamp", DESCENDING)],
                name="idx_activities_user_time"
            )
            await self.db.user_activities.create_index(
                [("activity_type", ASCENDING), ("timestamp", DESCENDING)],
                name="idx_activities_type_time"
            )
            await self.db.user_activities.create_index(
                [("timestamp", DESCENDING)],
                name="idx_activities_timestamp"
            )
            
            # TTL index for user activities (optional - keep last 365 days)
            await self.db.user_activities.create_index(
                [("timestamp", ASCENDING)],
                expireAfterSeconds=31536000,  # 365 days in seconds
                name="idx_activities_ttl"
            )
            
            # Configurations collection indexes
            await self.db.configurations.create_index(
                [("user_id", ASCENDING), ("updated_at", DESCENDING)],
                name="idx_configs_user_updated"
            )
            await self.db.configurations.create_index(
                [("id", ASCENDING), ("user_id", ASCENDING)],
                name="idx_configs_id_user"
            )
            await self.db.configurations.create_index(
                [("id", ASCENDING)],
                unique=True,
                name="idx_configs_id"
            )
            
            # Report logs collection indexes
            await self.db.report_logs.create_index(
                [("user_id", ASCENDING), ("timestamp", DESCENDING)],
                name="idx_reports_user_time"
            )
            await self.db.report_logs.create_index(
                [("timestamp", DESCENDING)],
                name="idx_reports_timestamp"
            )
            await self.db.report_logs.create_index(
                [("report_type", ASCENDING), ("timestamp", DESCENDING)],
                name="idx_reports_type_time"
            )
            
            # TTL index for report logs (optional - keep last 365 days)
            await self.db.report_logs.create_index(
                [("timestamp", ASCENDING)],
                expireAfterSeconds=31536000,  # 365 days
                name="idx_reports_ttl"
            )
            
            # Chat messages collection indexes
            await self.db.chat_messages.create_index(
                [("user_id", ASCENDING), ("session_id", ASCENDING), ("timestamp", ASCENDING)],
                name="idx_chat_user_session_time"
            )
            await self.db.chat_messages.create_index(
                [("session_id", ASCENDING), ("timestamp", ASCENDING)],
                name="idx_chat_session_time"
            )
            
            # TTL index for chat messages (keep last 90 days)
            await self.db.chat_messages.create_index(
                [("timestamp", ASCENDING)],
                expireAfterSeconds=7776000,  # 90 days in seconds
                name="idx_chat_ttl"
            )
            
            # Status checks collection (existing)
            await self.db.status_checks.create_index(
                [("timestamp", DESCENDING)],
                name="idx_status_timestamp"
            )
            
            logger.info("All database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
            # Don't raise - allow app to continue even if index creation fails
            
    async def setup_schema_validation(self):
        """Setup MongoDB schema validation for data integrity."""
        try:
            # Users collection validation
            await self.db.command({
                "collMod": "users",
                "validator": {
                    "$jsonSchema": {
                        "bsonType": "object",
                        "required": ["id", "email", "name", "role", "hashed_password", "created_at"],
                        "properties": {
                            "id": {"bsonType": "string"},
                            "email": {"bsonType": "string", "pattern": "^.+@.+\\..+$"},
                            "name": {"bsonType": "string", "minLength": 1},
                            "role": {"bsonType": "string", "enum": ["user", "admin"]},
                            "hashed_password": {"bsonType": "string"},
                            "created_at": {"bsonType": "string"}
                        }
                    }
                },
                "validationLevel": "moderate",  # Don't break on existing data
                "validationAction": "warn"  # Log warnings instead of rejecting
            })
            
            # User activities validation
            await self.db.command({
                "collMod": "user_activities",
                "validator": {
                    "$jsonSchema": {
                        "bsonType": "object",
                        "required": ["id", "user_id", "user_email", "activity_type", "timestamp"],
                        "properties": {
                            "id": {"bsonType": "string"},
                            "user_id": {"bsonType": "string"},
                            "user_email": {"bsonType": "string"},
                            "user_name": {"bsonType": "string"},
                            "activity_type": {"bsonType": "string", "enum": ["register", "login"]},
                            "timestamp": {"bsonType": "string"},
                            "ip_address": {"bsonType": ["string", "null"]},
                            "user_agent": {"bsonType": ["string", "null"]}
                        }
                    }
                },
                "validationLevel": "moderate",
                "validationAction": "warn"
            })
            
            # Configurations validation
            await self.db.command({
                "collMod": "configurations",
                "validator": {
                    "$jsonSchema": {
                        "bsonType": "object",
                        "required": ["id", "user_id", "name", "devices", "configuration", "results"],
                        "properties": {
                            "id": {"bsonType": "string"},
                            "user_id": {"bsonType": "string"},
                            "name": {"bsonType": "string", "minLength": 1},
                            "description": {"bsonType": ["string", "null"]},
                            "devices": {"bsonType": "object"},
                            "configuration": {"bsonType": "object"},
                            "results": {"bsonType": "object"},
                            "created_at": {"bsonType": "string"},
                            "updated_at": {"bsonType": "string"}
                        }
                    }
                },
                "validationLevel": "moderate",
                "validationAction": "warn"
            })
            
            # Report logs validation
            await self.db.command({
                "collMod": "report_logs",
                "validator": {
                    "$jsonSchema": {
                        "bsonType": "object",
                        "required": ["id", "user_id", "user_email", "report_type", "timestamp"],
                        "properties": {
                            "id": {"bsonType": "string"},
                            "user_id": {"bsonType": "string"},
                            "user_email": {"bsonType": "string"},
                            "user_name": {"bsonType": "string"},
                            "report_type": {"bsonType": "string"},
                            "timestamp": {"bsonType": "string"}
                        }
                    }
                },
                "validationLevel": "moderate",
                "validationAction": "warn"
            })
            
            logger.info("Schema validation rules applied successfully")
            
        except Exception as e:
            logger.warning(f"Schema validation setup encountered issues (non-critical): {e}")
            # Don't raise - validation is nice to have but not critical
            
    async def health_check(self) -> bool:
        """Check if database connection is healthy."""
        try:
            # Ping the database
            await self.client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
            
    async def close(self):
        """Close database connection."""
        if self.client:
            self.client.close()
            logger.info("Database connection closed")


# Global database manager instance
db_manager = DatabaseManager()
