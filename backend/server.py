from fastapi import FastAPI, APIRouter, Depends, HTTPException, File, UploadFile, Form, status, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from bson import ObjectId
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configurable frontend origins and cookie security for production
# Default includes common Vercel patterns - update with your actual domain
default_origins = "https://mapmoments.vercel.app,http://localhost:3000"
FRONTEND_ORIGINS_STR = os.environ.get("FRONTEND_ORIGINS", default_origins)
FRONTEND_ORIGINS = [origin.strip() for origin in FRONTEND_ORIGINS_STR.split(",") if origin.strip()]

# Helper function to check if origin is allowed (supports Vercel preview URLs)
def is_origin_allowed(origin: str) -> bool:
    if not origin:
        return False
    # Check exact matches
    if origin in FRONTEND_ORIGINS:
        return True
    # Check if it's a Vercel preview URL (any *.vercel.app subdomain)
    if origin.endswith(".vercel.app") and origin.startswith("https://"):
        return True
    return False

COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() in ("1", "true", "yes")

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL environment variable is required")
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=5000,
    tls=True
)
db = client.mapmoments
fs = AsyncIOMotorGridFSBucket(db)

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 168  # 7 days

# Create the main app
app = FastAPI()

# CORS must come BEFORE router - use FRONTEND_ORIGINS from env
# Use allow_origin_regex to support Vercel preview URLs (*.vercel.app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log active CORS origins for visibility in deployment logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.info(f"CORS allow_origins: {FRONTEND_ORIGINS}")

api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

# Rely on CORSMiddleware to handle OPTIONS automatically for preflight requests

# ===== Models =====
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    profile_photo: Optional[str] = None
    friends: List[str] = Field(default_factory=list)
    friend_requests: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Pin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    title: str
    description: str
    latitude: float
    longitude: float
    privacy: str = "public"  # public, friends, private
    likes: List[str] = Field(default_factory=list)  # user IDs who liked
    comments: List[dict] = Field(default_factory=list)
    media_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PinCreate(BaseModel):
    title: str
    description: str
    latitude: float
    longitude: float
    privacy: str = "private"

class Comment(BaseModel):
    text: str

class Media(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pin_id: str
    user_id: str
    file_id: str  # GridFS file ID
    media_type: str  # photo or video
    caption: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    title: str
    description: str
    event_date: str
    latitude: float
    longitude: float
    location_name: str
    attendees: List[str] = Field(default_factory=list)  # user IDs
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EventCreate(BaseModel):
    title: str
    description: str
    event_date: str
    latitude: float
    longitude: float
    location_name: str

# ===== Message Models =====
class MessageCreate(BaseModel):
    recipient_id: str
    content: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    sender_username: str
    recipient_id: str
    recipient_username: str
    content: str
    read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ===== Auth Helpers =====
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    return jwt.encode({'user_id': user_id, 'exp': expiration}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload['user_id']})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user.pop('_id', None)
    return user

# ===== Auth Routes =====
@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    try:
        existing = await db.users.find_one(
            {"$or": [{"email": user_data.email}, {"username": user_data.username}]}
        )
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")

        user = User(
            username=user_data.username,
            email=user_data.email
        )
        user_dict = user.model_dump()
        user_dict['password_hash'] = hash_password(user_data.password)

        await db.users.insert_one(user_dict)

        token = create_token(user.id)
        response.set_cookie(
            "token",
            token,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite="lax",
            max_age=JWT_EXPIRATION_HOURS * 3600
        )

        logger.info(f"New user registered: {user.email}")
        return {"token": token, "user": {"id": user.id, "username": user.username, "email": user.email}}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in /auth/register")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/auth/login")
async def login(login_data: UserLogin, response: Response):
    try:
        user = await db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        hashed = user.get('password_hash') or user.get('password')
        if not hashed or not verify_password(login_data.password, hashed):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_token(user['id'])
        response.set_cookie(
            "token",
            token,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite="lax",
            max_age=JWT_EXPIRATION_HOURS * 3600
        )

        logger.info(f"User login: {login_data.email}")
        user.pop('_id', None)
        user.pop('password_hash', None)
        user.pop('password', None)
        return {"token": token, "user": {"id": user['id'], "username": user['username'], "email": user['email']}}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in /auth/login")
        raise HTTPException(status_code=500, detail="Internal server error")

# GET placeholder to satisfy link prefetchers hitting login with GET
@api_router.get("/auth/login")
async def login_prefetch():
    return {"message": "Login endpoint requires POST"}

@api_router.post("/auth/guest")
async def guest_login(response: Response):
    # Create temporary guest user
    guest_id = str(uuid.uuid4())
    guest_user = {
        "id": guest_id,
        "username": f"Guest_{guest_id[:8]}",
        "email": f"guest_{guest_id[:8]}@temp.com",
        "is_guest": True,
        "friends": [],
        "friend_requests": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Store guest user temporarily (no password needed)
    await db.users.insert_one(guest_user)
    
    token = create_token(guest_id)
    response.set_cookie(
        "token", 
        token, 
        httponly=True, 
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=24 * 3600  # 24 hours for guest
    )
    return {"token": token, "user": {"id": guest_id, "username": guest_user["username"], "email": guest_user["email"], "is_guest": True}}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = dict(current_user)
    user.pop('password_hash', None)
    user.pop('password', None)
    return user

# ===== Pin Routes =====
@api_router.post("/pins", response_model=Pin)
async def create_pin(pin_data: PinCreate, current_user: dict = Depends(get_current_user)):
    # Fix A — add userId to pin document stored in MongoDB
    pin = Pin(
        user_id=current_user['id'],
        username=current_user['username'],
        **pin_data.model_dump()
    )
    await db.pins.insert_one(pin.model_dump())
    return pin

@api_router.get("/pins")
async def get_pins(privacy: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}

    is_guest = current_user.get('is_guest', False)

    if privacy:
        query['privacy'] = privacy
    else:
        friends = current_user.get('friends', [])

        if is_guest:
            # Guest users see only their private pins to avoid sharing with others
            query = {
                "user_id": current_user['id']
            }
        else:
            # Authenticated users see public pins, their own pins, and friends' pins
            query = {
                "$or": [
                    {"privacy": "public", "user_id": {"$ne": current_user['id']}},
                    {"user_id": current_user['id']},
                    {"$and": [{"privacy": "friends"}, {"user_id": {"$in": friends}}]}
                ]
            }

    pins = await db.pins.find(query).sort("created_at", -1).to_list(1000)

    # Embed media for each pin
    for pin in pins:
        media_items = await db.media.find({"pin_id": pin["id"]}).to_list(100)
        result_media = []
        for media in media_items:
            try:
                grid_out = await fs.open_download_stream(ObjectId(media["file_id"]))
                content = await grid_out.read()  # type: ignore[misc]
                # motor returns bytes from async read
                base64_data = base64.b64encode(content).decode("utf-8")
                ct = (grid_out.metadata or {}).get("content_type", "image/jpeg")
                media["file_data"] = f"data:{ct};base64,{base64_data}"
                result_media.append(media)
            except Exception as e:
                logging.error(f"Error embedding media for pin {pin['id']}: {e}")
                continue
        # drop internal ids
        for m in result_media:
            m.pop('_id', None)
        pin["media"] = result_media
        pin.pop('_id', None)

    return pins

@api_router.get("/users/{user_id}/pins")
async def get_user_pins(user_id: str, current_user: dict = Depends(get_current_user)):
    # List pins created by a specific user
    if user_id != current_user['id']:
        # Optionally add friend or public check to allow viewing others' pins
        raise HTTPException(status_code=403, detail="Not authorized to view pins of other users")
    pins = await db.pins.find({"user_id": user_id}).sort("created_at", -1).to_list(1000)
    for p in pins:
        p.pop('_id', None)
    return pins

@api_router.get("/pins/search")
async def search_pins(q: str, current_user: dict = Depends(get_current_user)):
    """Search pins by title or description"""
    query = {
        "privacy": "public",
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]
    }
    pins = await db.pins.find(query).sort("created_at", -1).limit(50).to_list(50)
    for p in pins:
        p.pop('_id', None)
    return pins

@api_router.get("/pins/{pin_id}")
async def get_pin(pin_id: str, current_user: dict = Depends(get_current_user)):
    pin = await db.pins.find_one({"id": pin_id})
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    
    # Check privacy
    if pin['privacy'] == 'private' and pin['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    if pin['privacy'] == 'friends' and pin['user_id'] != current_user['id']:
        if pin['user_id'] not in current_user.get('friends', []):
            raise HTTPException(status_code=403, detail="Access denied")
    
    pin.pop('_id', None)
    return pin

@api_router.delete("/pins/{pin_id}")
async def delete_pin(pin_id: str, current_user: dict = Depends(get_current_user)):
    pin = await db.pins.find_one({"id": pin_id})
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    if pin['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Delete associated media
    media_items = await db.media.find({"pin_id": pin_id}).to_list(1000)
    for media in media_items:
        try:
            await fs.delete(ObjectId(media['file_id']))
        except:
            pass
    await db.media.delete_many({"pin_id": pin_id})
    
    await db.pins.delete_one({"id": pin_id})
    return {"message": "Pin deleted"}

# ===== Like Routes =====
@api_router.post("/pins/{pin_id}/like")
async def like_pin(pin_id: str, current_user: dict = Depends(get_current_user)):
    pin = await db.pins.find_one({"id": pin_id})
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    
    likes = pin.get('likes', [])
    if current_user['id'] in likes:
        likes.remove(current_user['id'])
    else:
        likes.append(current_user['id'])
    
    await db.pins.update_one({"id": pin_id}, {"$set": {"likes": likes}})
    return {"likes": len(likes), "liked": current_user['id'] in likes}

# ===== Comment Routes =====
@api_router.post("/pins/{pin_id}/comments")
async def add_comment(pin_id: str, comment: Comment, current_user: dict = Depends(get_current_user)):
    pin = await db.pins.find_one({"id": pin_id}, {"_id": 0})
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")

    new_comment = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        "username": current_user['username'],
        "text": comment.text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.pins.update_one({"id": pin_id}, {"$push": {"comments": new_comment}})
    return new_comment

@api_router.delete("/pins/{pin_id}/comments/{comment_id}")
async def delete_comment(pin_id: str, comment_id: str, current_user: dict = Depends(get_current_user)):
    pin = await db.pins.find_one({"id": pin_id}, {"_id": 0})
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")

    if pin['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized to delete comments on this pin")

    # Remove the comment from the comments array
    await db.pins.update_one(
        {"id": pin_id},
        {"$pull": {"comments": {"id": comment_id}}}
    )
    return {"message": "Comment deleted"}

# ===== Media Routes =====
@api_router.post("/pins/{pin_id}/media")
async def upload_media(
    pin_id: str,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    pin = await db.pins.find_one({"id": pin_id}, {"_id": 0})
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    if pin['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Determine media type
    content_type = file.content_type or ""
    if content_type.startswith('image/'):
        media_type = "photo"
    elif content_type.startswith('video/'):
        media_type = "video"
    else:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Upload to GridFS
    file_content = await file.read()
    file_id = await fs.upload_from_stream(
        file.filename or "uploaded_file",
        file_content,
        metadata={"content_type": content_type}
    )
    
    # Create media record
    media = Media(
        pin_id=pin_id,
        user_id=current_user['id'],
        file_id=str(file_id),
        media_type=media_type,
        caption=caption
    )
    await db.media.insert_one(media.model_dump())
    
    # Update pin media count
    await db.pins.update_one({"id": pin_id}, {"$inc": {"media_count": 1}})
    
    return media.model_dump()

@api_router.get("/pins/{pin_id}/media")
async def get_media(pin_id: str, current_user: dict = Depends(get_current_user)):
    media_list = await db.media.find({"pin_id": pin_id}).to_list(1000)

    # Convert GridFS files to base64
    result = []
    for i, media in enumerate(media_list):
        try:
            grid_out = await fs.open_download_stream(ObjectId(media['file_id']))
            content = await grid_out.read()  # type: ignore[misc]
            if not isinstance(content, (bytes, bytearray)):
                logging.error(f"Media content is not bytes for media id {media['id']}")
                continue
            base64_data = base64.b64encode(content).decode('utf-8')
            content_type = (grid_out.metadata or {}).get('content_type', 'image/jpeg')
            media['file_data'] = f"data:{content_type};base64,{base64_data}"
            media.pop('_id', None)
            result.append(media)
            if i == 0 and base64_data:
                logging.info(f"Sample base64 for media id {media['id']}: {base64_data[:30]}...")
                logging.info(f"Content type: {content_type}")
        except Exception as e:
            logging.error(f"Error reading media: {e}")
            continue

    logging.info(f"Fetched {len(result)} media items for pin {pin_id}")
    for m in result:
        logging.info(f"Media id {m['id']} has file_data length {len(m['file_data'])}")

    return result

@api_router.delete("/media/{media_id}")
async def delete_media(media_id: str, current_user: dict = Depends(get_current_user)):
    media = await db.media.find_one({"id": media_id})
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    if media['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Delete from GridFS
    try:
        await fs.delete(ObjectId(media['file_id']))
    except:
        pass
    
    await db.media.delete_one({"id": media_id})
    
    # Update pin media count
    await db.pins.update_one({"id": media['pin_id']}, {"$inc": {"media_count": -1}})
    
    return {"message": "Media deleted"}

# ===== Friend Routes =====
@api_router.post("/friends/request/{user_id}")
async def send_friend_request(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id == current_user['id']:
        raise HTTPException(status_code=400, detail="Cannot add yourself")
    
    target_user = await db.users.find_one({"id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already friends
    if user_id in current_user.get('friends', []):
        raise HTTPException(status_code=400, detail="Already friends")
    
    # Add to friend requests
    await db.users.update_one(
        {"id": user_id},
        {"$addToSet": {"friend_requests": current_user['id']}}
    )
    
    return {"message": "Friend request sent"}

@api_router.post("/friends/accept/{user_id}")
async def accept_friend_request(user_id: str, current_user: dict = Depends(get_current_user)):
    # Check if request exists
    if user_id not in current_user.get('friend_requests', []):
        raise HTTPException(status_code=400, detail="No friend request found")
    
    # Add to both friends lists
    await db.users.update_one(
        {"id": current_user['id']},
        {
            "$addToSet": {"friends": user_id},
            "$pull": {"friend_requests": user_id}
        }
    )
    await db.users.update_one(
        {"id": user_id},
        {"$addToSet": {"friends": current_user['id']}}
    )
    
    return {"message": "Friend request accepted"}

@api_router.get("/friends")
async def get_friends(current_user: dict = Depends(get_current_user)):
    friend_ids = current_user.get('friends', [])
    friends = await db.users.find({"id": {"$in": friend_ids}}).to_list(1000)
    for f in friends:
        f.pop('_id', None)
        f.pop('password_hash', None)
        f.pop('password', None)
    return friends

@api_router.get("/friends/requests")
async def get_friend_requests(current_user: dict = Depends(get_current_user)):
    request_ids = current_user.get('friend_requests', [])
    requests = await db.users.find({"id": {"$in": request_ids}}).to_list(1000)
    for r in requests:
        r.pop('_id', None)
        r.pop('password_hash', None)
        r.pop('password', None)
    return requests

# ===== User Search =====
@api_router.get("/users/search")
async def search_users(q: str, current_user: dict = Depends(get_current_user)):
    users = await db.users.find(
        {
            "$or": [
                {"username": {"$regex": q, "$options": "i"}},
                {"email": {"$regex": q, "$options": "i"}}
            ],
            "id": {"$ne": current_user['id']}
        }
    ).limit(20).to_list(20)
    for u in users:
        u.pop('_id', None)
        u.pop('password_hash', None)
        u.pop('password', None)
    return users

# ===== Profile Picture Routes =====
@api_router.post("/users/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Determine media type
    content_type = file.content_type or ""
    if not content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")

    # Upload to GridFS
    file_content = await file.read()
    file_id = await fs.upload_from_stream(
        file.filename or "profile_picture",
        file_content,
        metadata={"content_type": content_type}
    )

    # Update user profile
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": {"profile_photo": str(file_id)}}
    )

    return {"message": "Profile picture updated", "file_id": str(file_id)}

@api_router.get("/users/{user_id}/profile-picture")
async def get_profile_picture(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user or not user.get('profile_photo'):
        raise HTTPException(status_code=404, detail="Profile picture not found")

    try:
        grid_out = await fs.open_download_stream(ObjectId(user['profile_photo']))
        content = await grid_out.read()  # type: ignore[misc]
        base64_data = base64.b64encode(content).decode("utf-8")
        ct = (grid_out.metadata or {}).get("content_type", "image/jpeg")
        return {"file_data": f"data:{ct};base64,{base64_data}"}
    except Exception as e:
        logging.error(f"Error retrieving profile picture: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving profile picture")

# ===== Message Routes =====
@api_router.post("/messages")
async def send_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    # Check if recipient is a friend
    if message_data.recipient_id not in current_user.get('friends', []):
        raise HTTPException(status_code=403, detail="Can only message friends")

    # Get recipient info
    recipient = await db.users.find_one({"id": message_data.recipient_id})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    message = Message(
        sender_id=current_user['id'],
        sender_username=current_user['username'],
        recipient_id=message_data.recipient_id,
        recipient_username=recipient['username'],
        content=message_data.content
    )

    await db.messages.insert_one(message.model_dump())
    return message

@api_router.get("/messages/{friend_id}")
async def get_messages(friend_id: str, current_user: dict = Depends(get_current_user)):
    # Check if friend_id is actually a friend
    if friend_id not in current_user.get('friends', []):
        raise HTTPException(status_code=403, detail="Can only view messages with friends")

    # Get messages between current user and friend
    messages = await db.messages.find(
        {
            "$or": [
                {"sender_id": current_user['id'], "recipient_id": friend_id},
                {"sender_id": friend_id, "recipient_id": current_user['id']}
            ]
        }
    ).sort("created_at", 1).to_list(1000)
    for m in messages:
        m.pop('_id', None)

    return messages

@api_router.get("/messages")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    # Get all conversations (latest message from each friend)
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"sender_id": current_user['id']},
                    {"recipient_id": current_user['id']}
                ]
            }
        },
        {
            "$sort": {"created_at": -1}
        },
        {
            "$group": {
                "_id": {
                    "$cond": {
                        "if": {"$eq": ["$sender_id", current_user['id']]},
                        "then": "$recipient_id",
                        "else": "$sender_id"
                    }
                },
                "latest_message": {"$first": "$$ROOT"}
            }
        },
        {
            "$replaceRoot": {"newRoot": "$latest_message"}
        }
    ]

    conversations = await db.messages.aggregate(pipeline).to_list(100)
    return conversations

# ===== Event Routes =====
@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: dict = Depends(get_current_user)):
    event = Event(
        user_id=current_user['id'],
        username=current_user['username'],
        **event_data.model_dump()
    )
    await db.events.insert_one(event.model_dump())
    return event

@api_router.get("/events")
async def get_events(current_user: dict = Depends(get_current_user)):
    events = await db.events.find({}).sort("event_date", 1).to_list(1000)
    for e in events:
        e.pop('_id', None)
    return events

@api_router.get("/events/search")
async def search_events(q: str, current_user: dict = Depends(get_current_user)):
    """Search events by title, description, or location"""
    query = {
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"location_name": {"$regex": q, "$options": "i"}}
        ]
    }
    events = await db.events.find(query).sort("event_date", 1).limit(50).to_list(50)
    for e in events:
        e.pop('_id', None)
    return events

@api_router.post("/events/{event_id}/attend")
async def attend_event(event_id: str, current_user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    attendees = event.get('attendees', [])
    if current_user['id'] in attendees:
        attendees.remove(current_user['id'])
    else:
        attendees.append(current_user['id'])
    
    await db.events.update_one({"id": event_id}, {"$set": {"attendees": attendees}})
    return {"attendees": len(attendees), "attending": current_user['id'] in attendees}

# ===== Discovery Routes =====
@api_router.get("/discover/trending")
async def get_trending(current_user: dict = Depends(get_current_user)):
    # Get public pins sorted by likes
    pipeline = [
        {"$match": {"privacy": "public"}},
        {"$addFields": {"like_count": {"$size": "$likes"}}},
        {"$sort": {"like_count": -1, "created_at": -1}},
        {"$limit": 50}
    ]
    trending = await db.pins.aggregate(pipeline).to_list(50)
    for t in trending:
        t.pop('_id', None)
    return trending

@api_router.get("/discover/nearby")
async def get_nearby(lat: float, lng: float, radius_km: float = 10, current_user: dict = Depends(get_current_user)):
    # Simple distance calculation (for production, use geospatial queries)
    all_pins = await db.pins.find({"privacy": "public"}).to_list(1000)
    
    nearby = []
    for pin in all_pins:
        # Haversine formula approximation
        lat_diff = abs(pin['latitude'] - lat)
        lng_diff = abs(pin['longitude'] - lng)
        distance = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111  # rough km
        if distance <= radius_km:
            pin['distance'] = round(distance, 2)
            nearby.append(pin)
    
    nearby.sort(key=lambda x: x['distance'])
    return nearby[:50]

# Include router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
