from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    moderator = "moderator"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    refresh_tokens = relationship("RefreshToken", back_populates="user")
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    submissions = relationship("Submission", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")
    bookmarks = relationship("ProblemBookmark", back_populates="user")
    weak_topics = relationship("UserWeakTopic", back_populates="user")
    following = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower")
    followers = relationship("Follow", foreign_keys="Follow.following_id", back_populates="following")
    chat_messages = relationship("ChatMessage", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")