from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Enum
from sqlalchemy.relationship import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class UserRole(enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"

class DealStatus(enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    WON = "won"
    LOST = "lost"

class TaskStatus(enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Связи
    deals = relationship("Deal", back_populates="manager")
    tasks = relationship("Task", back_populates="assigned_user")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    email = Column(String(100), index=True)
    phone = Column(String(20))
    company = Column(String(100))
    address = Column(Text)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Связи
    deals = relationship("Deal", back_populates="client")

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    amount = Column(Float, default=0.0)
    status = Column(Enum(DealStatus), default=DealStatus.NEW)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Внешние ключи
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Связи
    client = relationship("Client", back_populates="deals")
    manager = relationship("User", back_populates="deals")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    deadline = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Внешние ключи
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Связи
    assigned_user = relationship("User", back_populates="tasks")

class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # create, update, delete
    entity_type = Column(String(50), nullable=False)  # client, deal, task
    entity_id = Column(Integer, nullable=False)
    details = Column(Text)  # JSON с деталями изменений
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связи
    user = relationship("User")