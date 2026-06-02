from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Float, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from database import Base
from datetime import datetime

class Difficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    expert = "expert"

class ProblemStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"

class Problem(Base):
    __tablename__ = "problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    input_format = Column(Text, nullable=False)
    output_format = Column(Text, nullable=False)
    constraints = Column(Text, nullable=False)
    difficulty = Column(Enum(Difficulty), nullable=False)
    status = Column(Enum(ProblemStatus), default=ProblemStatus.draft)
    time_limit_ms = Column(Integer, default=2000)
    memory_limit_mb = Column(Integer, default=256)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    solve_count = Column(Integer, default=0)
    attempt_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    is_public = Column(Boolean, default=True)
    difficulty_code = Column(String(3), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User")
    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="problem")
    tag_map = relationship("ProblemTagMap", back_populates="problem", cascade="all, delete-orphan")
    editorial = relationship("Editorial", back_populates="problem", uselist=False)
    bookmarks = relationship("ProblemBookmark", back_populates="problem")
    weak_topics = relationship("UserWeakTopic", back_populates="problem")

    @property
    def tags(self):
        return [tm.tag for tm in self.tag_map if tm.tag]