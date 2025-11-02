from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta

# Import auth utilities
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user,
    get_current_user_optional,
    get_current_admin,
    Token,
    TokenData
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============= MODELS =============

# User Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = "user"  # 'user' or 'admin'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserInDB(User):
    hashed_password: str

# User Activity Models
class UserActivity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    user_name: str
    activity_type: str  # 'register' or 'login'
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class UserActivityCreate(BaseModel):
    user_id: str
    user_email: str
    user_name: str
    activity_type: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

# Configuration Models
class SavedConfiguration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: Optional[str] = None
    devices: Dict[str, Any]
    configuration: Dict[str, Any]
    results: Dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConfigurationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    devices: Dict[str, Any]
    configuration: Dict[str, Any]
    results: Dict[str, Any]

class ConfigurationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    devices: Optional[Dict[str, Any]] = None
    configuration: Optional[Dict[str, Any]] = None
    results: Optional[Dict[str, Any]] = None

# AI Chat Models
class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageCreate(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    session_id: str

# Report Generation Models
class ReportLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    user_name: str
    report_type: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Status Check Models (existing)
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# ============= HELPER FUNCTIONS =============

def prepare_for_mongo(data: dict) -> dict:
    """Convert datetime objects to ISO strings for MongoDB storage."""
    doc = data.copy()
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

def parse_from_mongo(item: dict) -> dict:
    """Convert ISO string timestamps back to datetime objects."""
    for key, value in item.items():
        if isinstance(value, str) and key in ['created_at', 'updated_at', 'timestamp']:
            try:
                item[key] = datetime.fromisoformat(value)
            except ValueError:
                pass
    return item

async def log_user_activity(
    user_id: str,
    user_email: str,
    user_name: str,
    activity_type: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Log user activity to database."""
    activity = UserActivity(
        user_id=user_id,
        user_email=user_email,
        user_name=user_name,
        activity_type=activity_type,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    doc = prepare_for_mongo(activity.model_dump())
    await db.user_activities.insert_one(doc)


# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, request: Request):
    """Register a new user."""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = UserInDB(
        email=user_data.email,
        name=user_data.name,
        hashed_password=get_password_hash(user_data.password),
        role="user"  # Default role
    )
    
    # Save to database
    doc = prepare_for_mongo(user.model_dump())
    await db.users.insert_one(doc)
    
    # Log registration activity
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", None)
    await log_user_activity(
        user_id=user.id,
        user_email=user.email,
        user_name=user.name,
        activity_type="register",
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    # Return user without password
    return User(**user.model_dump())

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin, request: Request):
    """Login user and return JWT token."""
    # Find user
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    user = UserInDB(**parse_from_mongo(user_doc))
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    
    # Log login activity
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", None)
    await log_user_activity(
        user_id=user.id,
        user_email=user.email,
        user_name=user.name,
        activity_type="login",
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    return Token(access_token=access_token, token_type="bearer")

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """Get current user information."""
    user_doc = await db.users.find_one({"id": current_user.user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(**parse_from_mongo(user_doc))

@api_router.get("/auth/my-activity", response_model=List[UserActivity])
async def get_my_activity(
    limit: int = 20,
    current_user: TokenData = Depends(get_current_user)
):
    """Get current user's activity history."""
    activities = await db.user_activities.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return [UserActivity(**parse_from_mongo(activity)) for activity in activities]


# ============= ADMIN ROUTES =============

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(current_admin: TokenData = Depends(get_current_admin)):
    """Get all registered users (admin only)."""
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
    return [User(**parse_from_mongo(user)) for user in users]

@api_router.get("/admin/activity", response_model=List[UserActivity])
async def get_user_activity(
    limit: int = 100,
    current_admin: TokenData = Depends(get_current_admin)
):
    """Get user activity logs (admin only)."""
    activities = await db.user_activities.find(
        {},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return [UserActivity(**parse_from_mongo(activity)) for activity in activities]

@api_router.get("/admin/stats")
async def get_admin_stats(current_admin: TokenData = Depends(get_current_admin)):
    """Get dashboard statistics (admin only)."""
    # Total users
    total_users = await db.users.count_documents({})
    
    # Users registered in last 7 days
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_users = await db.users.count_documents({
        "created_at": {"$gte": seven_days_ago.isoformat()}
    })
    
    # Total logins
    total_logins = await db.user_activities.count_documents({"activity_type": "login"})
    
    # Total registrations
    total_registrations = await db.user_activities.count_documents({"activity_type": "register"})
    
    # Recent activity (last 24 hours)
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_activity = await db.user_activities.count_documents({
        "timestamp": {"$gte": twenty_four_hours_ago.isoformat()}
    })
    
    return {
        "total_users": total_users,
        "recent_users_7d": recent_users,
        "total_logins": total_logins,
        "total_registrations": total_registrations,
        "recent_activity_24h": recent_activity
    }

@api_router.get("/admin/charts/signups")
async def get_signup_trend(
    days: int = 7,
    current_admin: TokenData = Depends(get_current_admin)
):
    """Get signup trend data for charts (admin only)."""
    # Get signups for last N days
    signup_data = []
    for i in range(days, -1, -1):
        date = datetime.now(timezone.utc) - timedelta(days=i)
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        count = await db.user_activities.count_documents({
            "activity_type": "register",
            "timestamp": {
                "$gte": start_of_day.isoformat(),
                "$lte": end_of_day.isoformat()
            }
        })
        
        signup_data.append({
            "date": start_of_day.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return signup_data

@api_router.get("/admin/charts/logins")
async def get_login_frequency(
    days: int = 7,
    current_admin: TokenData = Depends(get_current_admin)
):
    """Get login frequency data for charts (admin only)."""
    # Get logins for last N days
    login_data = []
    for i in range(days, -1, -1):
        date = datetime.now(timezone.utc) - timedelta(days=i)
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        count = await db.user_activities.count_documents({
            "activity_type": "login",
            "timestamp": {
                "$gte": start_of_day.isoformat(),
                "$lte": end_of_day.isoformat()
            }
        })
        
        login_data.append({
            "date": start_of_day.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return login_data


# ============= CONFIGURATION ROUTES =============

@api_router.post("/configurations", response_model=SavedConfiguration, status_code=status.HTTP_201_CREATED)
async def create_configuration(
    config_data: ConfigurationCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Save a new configuration for the authenticated user."""
    config = SavedConfiguration(
        user_id=current_user.user_id,
        **config_data.model_dump()
    )
    
    # Save to database
    doc = prepare_for_mongo(config.model_dump())
    await db.configurations.insert_one(doc)
    
    return config

@api_router.get("/configurations", response_model=List[SavedConfiguration])
async def get_user_configurations(current_user: TokenData = Depends(get_current_user)):
    """Get all configurations for the authenticated user."""
    configs = await db.configurations.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    
    return [SavedConfiguration(**parse_from_mongo(config)) for config in configs]

@api_router.get("/configurations/{config_id}", response_model=SavedConfiguration)
async def get_configuration(
    config_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Get a specific configuration."""
    config_doc = await db.configurations.find_one(
        {"id": config_id, "user_id": current_user.user_id},
        {"_id": 0}
    )
    
    if not config_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found"
        )
    
    return SavedConfiguration(**parse_from_mongo(config_doc))

@api_router.put("/configurations/{config_id}", response_model=SavedConfiguration)
async def update_configuration(
    config_id: str,
    update_data: ConfigurationUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update a configuration."""
    # Check if configuration exists and belongs to user
    existing = await db.configurations.find_one(
        {"id": config_id, "user_id": current_user.user_id},
        {"_id": 0}
    )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found"
        )
    
    # Update only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.configurations.update_one(
        {"id": config_id, "user_id": current_user.user_id},
        {"$set": update_dict}
    )
    
    # Fetch updated document
    updated_doc = await db.configurations.find_one(
        {"id": config_id},
        {"_id": 0}
    )
    
    return SavedConfiguration(**parse_from_mongo(updated_doc))

@api_router.delete("/configurations/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_configuration(
    config_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a configuration."""
    result = await db.configurations.delete_one(
        {"id": config_id, "user_id": current_user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found"
        )
    
    return None


# ============= AI ASSISTANT ROUTES =============

@api_router.post("/ai/chat", response_model=ChatResponse)
async def chat_with_assistant(
    chat_data: ChatMessageCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Chat with AI assistant."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Generate or use provided session ID
    session_id = chat_data.session_id or str(uuid.uuid4())
    
    # Get last 10 messages for context
    previous_messages = await db.chat_messages.find(
        {"user_id": current_user.user_id, "session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).limit(10).to_list(10)
    
    # Initialize AI chat
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    system_message = """You are an AI Security Assistant for size.ai, a SIEM & XDR infrastructure sizing calculator.
    
Your role is to help users with:
- Understanding security infrastructure configurations
- Calculating hardware and storage requirements
- Explaining EPS (Events Per Second) and data volume concepts
- Compliance requirements (PCI-DSS, HIPAA, GDPR, SOC 2)
- High availability and disaster recovery planning
- Cost optimization strategies

Be professional, concise, and helpful. Provide actionable insights based on security best practices."""
    
    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=system_message
    ).with_model("openai", "gpt-4o-mini")
    
    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.user_id,
        session_id=session_id,
        role="user",
        content=chat_data.message
    )
    await db.chat_messages.insert_one(prepare_for_mongo(user_msg.model_dump()))
    
    # Get AI response
    user_message = UserMessage(text=chat_data.message)
    ai_response = await chat.send_message(user_message)
    
    # Save assistant message
    assistant_msg = ChatMessage(
        user_id=current_user.user_id,
        session_id=session_id,
        role="assistant",
        content=ai_response
    )
    await db.chat_messages.insert_one(prepare_for_mongo(assistant_msg.model_dump()))
    
    return ChatResponse(message=ai_response, session_id=session_id)

@api_router.get("/ai/history/{session_id}", response_model=List[ChatMessage])
async def get_chat_history(
    session_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Get chat history for a session."""
    messages = await db.chat_messages.find(
        {"user_id": current_user.user_id, "session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    
    return [ChatMessage(**parse_from_mongo(msg)) for msg in messages]


# ============= REPORT GENERATION TRACKING =============

@api_router.post("/reports/log")
async def log_report_generation(
    report_type: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Log report generation activity."""
    # Get user details
    user_doc = await db.users.find_one({"id": current_user.user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = User(**parse_from_mongo(user_doc))
    
    # Create report log
    report_log = ReportLog(
        user_id=user.id,
        user_email=user.email,
        user_name=user.name,
        report_type=report_type
    )
    
    doc = prepare_for_mongo(report_log.model_dump())
    await db.report_logs.insert_one(doc)
    
    return {"status": "logged", "report_id": report_log.id}


# ============= EXISTING ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "size.ai API - SIEM/XDR Infrastructure Sizing Calculator"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = prepare_for_mongo(status_obj.model_dump())
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    return [StatusCheck(**parse_from_mongo(check)) for check in status_checks]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()