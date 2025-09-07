from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..models import User, ActionLog
from ..schemas import UserCreate, UserUpdate, UserResponse, UserRole
from ..auth import get_current_active_user, require_admin, get_password_hash
import json

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    role: Optional[UserRole] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение списка пользователей"""
    query = db.query(User)
    
    if search:
        query = query.filter(
            or_(
                User.name.contains(search),
                User.email.contains(search)
            )
        )
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/managers", response_model=List[UserResponse])
async def get_managers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение списка менеджеров для выпадающих списков"""
    managers = db.query(User).filter(
        or_(User.role == UserRole.MANAGER, User.role == UserRole.ADMIN)
    ).all()
    return managers

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение пользователя по ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Создание нового пользователя (только для админов)"""
    # Проверка существования пользователя
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Создание нового пользователя
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="create",
        entity_type="user",
        entity_id=db_user.id,
        details=json.dumps({"name": user.name, "email": user.email, "role": user.role.value})
    )
    db.add(log_entry)
    db.commit()
    
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Обновление пользователя"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Проверка прав: пользователь может редактировать только себя, админ - всех
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Проверка уникальности email при обновлении
    update_data = user_update.dict(exclude_unset=True)
    if "email" in update_data:
        existing_user = db.query(User).filter(
            User.email == update_data["email"],
            User.id != user_id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Сохранение старых данных для логирования
    old_data = {
        "name": user.name,
        "email": user.email,
        "role": user.role.value
    }
    
    # Обновление полей
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="update",
        entity_type="user",
        entity_id=user.id,
        details=json.dumps({"old": old_data, "new": update_data})
    )
    db.add(log_entry)
    db.commit()
    
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Удаление пользователя (только для админов)"""
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Сохранение данных для логирования
    user_data = {
        "name": user.name,
        "email": user.email,
        "role": user.role.value
    }
    
    db.delete(user)
    db.commit()
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="delete",
        entity_type="user",
        entity_id=user_id,
        details=json.dumps(user_data)
    )
    db.add(log_entry)
    db.commit()
    
    return {"message": "User deleted successfully"}