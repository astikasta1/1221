from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..models import Client, User, ActionLog
from ..schemas import ClientCreate, ClientUpdate, ClientResponse
from ..auth import get_current_active_user
import json

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/", response_model=ClientResponse)
async def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Создание нового клиента"""
    db_client = Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="create",
        entity_type="client",
        entity_id=db_client.id,
        details=json.dumps(client.dict())
    )
    db.add(log_entry)
    db.commit()
    
    return db_client

@router.get("/", response_model=List[ClientResponse])
async def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение списка клиентов с поиском и пагинацией"""
    query = db.query(Client)
    
    if search:
        query = query.filter(
            or_(
                Client.name.contains(search),
                Client.email.contains(search),
                Client.company.contains(search),
                Client.phone.contains(search)
            )
        )
    
    clients = query.offset(skip).limit(limit).all()
    return clients

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получение клиента по ID"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Обновление клиента"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Сохранение старых данных для логирования
    old_data = {
        "name": client.name,
        "email": client.email,
        "phone": client.phone,
        "company": client.company,
        "address": client.address,
        "comment": client.comment
    }
    
    # Обновление полей
    update_data = client_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="update",
        entity_type="client",
        entity_id=client.id,
        details=json.dumps({"old": old_data, "new": update_data})
    )
    db.add(log_entry)
    db.commit()
    
    return client

@router.delete("/{client_id}")
async def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Удаление клиента"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Сохранение данных для логирования
    client_data = {
        "name": client.name,
        "email": client.email,
        "company": client.company
    }
    
    db.delete(client)
    db.commit()
    
    # Логирование
    log_entry = ActionLog(
        user_id=current_user.id,
        action="delete",
        entity_type="client",
        entity_id=client_id,
        details=json.dumps(client_data)
    )
    db.add(log_entry)
    db.commit()
    
    return {"message": "Client deleted successfully"}