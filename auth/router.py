from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
import secrets, uuid, os

from database import get_db
from . import crud, schemas
from users.crud import get_user_by_email, get_user_by_username, verify_password, create_user, activate_user
from users.schemas import UserCreate
from user_profiles.crud import create_profile, update_profile
from user_profiles.schemas import UserProfileUpdate
from user_settings.crud import create_settings
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

bearer_scheme = HTTPBearer()

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile",
        "timeout": 30,  
    },
)

# --- Утилиты ---
def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token_str() -> str:
    return secrets.token_urlsafe(64)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None

# --- Зависимости ---
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    from users.crud import get_user_by_id
    user = get_user_by_id(db, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    return user

def require_role(roles: list[str]):
    def checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user
    return checker

# --- Эндпоинты ---
@router.post("/register", response_model=schemas.RegisterResponse, status_code=201)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if get_user_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    user = create_user(db, data)
    create_profile(db, user.id)
    create_settings(db, user.id)
    return user

@router.post("/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token_str()
    crud.create_refresh_token(db, user.id, refresh_token,
                              datetime.utcnow() + timedelta(days=30))
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=schemas.RefreshTokenResponse)
def refresh(data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    db_token = crud.get_refresh_token(db, data.refresh_token)
    if not db_token or db_token.is_revoked or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    return {"access_token": create_access_token(str(db_token.user_id)), "token_type": "bearer"}

@router.post("/logout", status_code=204)
def logout(data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    crud.revoke_refresh_token(db, data.refresh_token)

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        return RedirectResponse(f"{frontend_url}/login?error=google_failed")

    user_info = token.get("userinfo")
    if not user_info:
        return RedirectResponse(f"{frontend_url}/login?error=no_userinfo")

    email = user_info.get("email")
    user = get_user_by_email(db, email)

    if not user:
        username = email.split("@")[0]
        if get_user_by_username(db, username):
            username = username + "_" + secrets.token_hex(3)
        user = create_user(db, UserCreate(
            username=username,
            email=email,
            password=secrets.token_urlsafe(32)
        ))
        create_settings(db, user.id)
        create_profile(db, user.id)
        update_profile(db, user.id, UserProfileUpdate(
            first_name=user_info.get("name", ""),
            avatar_url=user_info.get("picture", "")
        ))
        activate_user(db, user.id)

    if not user.is_active:
        return RedirectResponse(f"{frontend_url}/login?error=disabled")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token_str()
    crud.create_refresh_token(db, user.id, refresh_token,
                              datetime.utcnow() + timedelta(days=30))

    # Redirect to frontend — it reads tokens from URL params and saves to localStorage
    return RedirectResponse(
        f"{frontend_url}/auth/callback"
        f"?access_token={access_token}"
        f"&refresh_token={refresh_token}"
    )