from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from ..database import get_db
from ..models import Task, User, ActionLog
from ..schemas import TaskCreate, TaskUpdate, TaskResponse, TaskStatus
from ..auth import get_current_active_user
import json

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Создание новой задачи"""
    # Проверка существования пользователя
    assigned_user = db.query(User).filter(User.id == task.assigned_user_id).first()
    if not assigned_user:
        raise HTTPException(status_code=404, detail="Assigned user not found")
    
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="create",
        entity_type="task",
        entity_id=db_task.id,
        details=json.dumps(task.dict(), default=str)
    )
    db.add(log_entry)
    db.commit()
    
    return db_task

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    status: Optional[TaskStatus] = Query(None),
    assigned_user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение списка задач с фильтрацией и поиском"""
    query = db.query(Task).options(joinedload(Task.assigned_user))
    
    if search:
        query = query.filter(
            or_(
                Task.title.contains(search),
                Task.description.contains(search)
            )
        )
    
    if status:
        query = query.filter(Task.status == status)
    
    if assigned_user_id:
        query = query.filter(Task.assigned_user_id == assigned_user_id)
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/my", response_model=List[TaskResponse])
async def get_my_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TaskStatus] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение задач текущего пользователя"""
    query = db.query(Task).options(joinedload(Task.assigned_user)).filter(
        Task.assigned_user_id == current_user.id
    )
    
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение задачи по ID"""
    task = db.query(Task).options(joinedload(Task.assigned_user)).filter(
        Task.id == task_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Обновление задачи"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Проверка существования пользователя при обновлении
    update_data = task_update.dict(exclude_unset=True)
    if "assigned_user_id" in update_data:
        assigned_user = db.query(User).filter(User.id == update_data["assigned_user_id"]).first()
        if not assigned_user:
            raise HTTPException(status_code=404, detail="Assigned user not found")
    
    # Сохранение старых данных для логирования
    old_data = {
        "title": task.title,
        "description": task.description,
        "status": task.status.value,
        "deadline": task.deadline.isoformat() if task.deadline else None,
        "assigned_user_id": task.assigned_user_id
    }
    
    # Обновление полей
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="update",
        entity_type="task",
        entity_id=task.id,
        details=json.dumps({"old": old_data, "new": update_data}, default=str)
    )
    db.add(log_entry)
    db.commit()
    
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Удаление задачи"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Сохранение данных для логирования
    task_data = {
        "title": task.title,
        "status": task.status.value,
        "assigned_user_id": task.assigned_user_id
    }
    
    db.delete(task)
    db.commit()
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="delete",
        entity_type="task",
        entity_id=task_id,
        details=json.dumps(task_data)
    )
    db.add(log_entry)
    db.commit()
    
    return {"message": "Task deleted successfully"}