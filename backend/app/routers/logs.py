from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import ActionLog, User
from ..schemas import ActionLogResponse
from ..auth import get_current_active_user

router = APIRouter(prefix="/logs", tags=["Action Logs"])

@router.get("/", response_model=List[ActionLogResponse])
async def get_action_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    entity_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение логов действий с фильтрацией"""
    query = db.query(ActionLog).options(joinedload(ActionLog.user))
    
    if entity_type:
        query = query.filter(ActionLog.entity_type == entity_type)
    
    if action:
        query = query.filter(ActionLog.action == action)
    
    if user_id:
        query = query.filter(ActionLog.user_id == user_id)
    
    # Сортировка по дате создания (новые сначала)
    logs = query.order_by(ActionLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs