from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from ..database import get_db
from ..models import Deal, User, Client, ActionLog
from ..schemas import DealCreate, DealUpdate, DealResponse, DealStatus
from ..auth import get_current_active_user
import json

router = APIRouter(prefix="/deals", tags=["Deals"])

@router.post("/", response_model=DealResponse)
async def create_deal(
    deal: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Создание новой сделки"""
    # Проверка существования клиента и менеджера
    client = db.query(Client).filter(Client.id == deal.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    manager = db.query(User).filter(User.id == deal.manager_id).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")
    
    db_deal = Deal(**deal.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="create",
        entity_type="deal",
        entity_id=db_deal.id,
        details=json.dumps(deal.dict())
    )
    db.add(log_entry)
    db.commit()
    
    return db_deal

@router.get("/", response_model=List[DealResponse])
async def get_deals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    status: Optional[DealStatus] = Query(None),
    manager_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение списка сделок с фильтрацией и поиском"""
    query = db.query(Deal).options(
        joinedload(Deal.client),
        joinedload(Deal.manager)
    )
    
    if search:
        query = query.join(Client).filter(
            or_(
                Deal.title.contains(search),
                Deal.description.contains(search),
                Client.name.contains(search),
                Client.company.contains(search)
            )
        )
    
    if status:
        query = query.filter(Deal.status == status)
    
    if manager_id:
        query = query.filter(Deal.manager_id == manager_id)
    
    deals = query.offset(skip).limit(limit).all()
    return deals

@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение сделки по ID"""
    deal = db.query(Deal).options(
        joinedload(Deal.client),
        joinedload(Deal.manager)
    ).filter(Deal.id == deal_id).first()
    
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal

@router.put("/{deal_id}", response_model=DealResponse)
async def update_deal(
    deal_id: int,
    deal_update: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Обновление сделки"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Проверка существования клиента и менеджера при обновлении
    update_data = deal_update.dict(exclude_unset=True)
    if "client_id" in update_data:
        client = db.query(Client).filter(Client.id == update_data["client_id"]).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
    
    if "manager_id" in update_data:
        manager = db.query(User).filter(User.id == update_data["manager_id"]).first()
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")
    
    # Сохранение старых данных для логирования
    old_data = {
        "title": deal.title,
        "amount": deal.amount,
        "status": deal.status.value,
        "description": deal.description,
        "client_id": deal.client_id,
        "manager_id": deal.manager_id
    }
    
    # Обновление полей
    for field, value in update_data.items():
        setattr(deal, field, value)
    
    db.commit()
    db.refresh(deal)
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="update",
        entity_type="deal",
        entity_id=deal.id,
        details=json.dumps({"old": old_data, "new": update_data})
    )
    db.add(log_entry)
    db.commit()
    
    return deal

@router.delete("/{deal_id}")
async def delete_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Удаление сделки"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Сохранение данных для логирования
    deal_data = {
        "title": deal.title,
        "amount": deal.amount,
        "status": deal.status.value
    }
    
    db.delete(deal)
    db.commit()
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="delete",
        entity_type="deal",
        entity_id=deal_id,
        details=json.dumps(deal_data)
    )
    db.add(log_entry)
    db.commit()
    
    return {"message": "Deal deleted successfully"}