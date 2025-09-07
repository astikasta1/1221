#!/usr/bin/env python3
"""
Скрипт для создания тестовых данных в CRM системе
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import User, Client, Deal, Task, ActionLog, UserRole, DealStatus, TaskStatus
from app.auth import get_password_hash
import json

def create_test_data():
    """Создание тестовых данных"""
    
    # Создание всех таблиц
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Проверяем, есть ли уже данные
        if db.query(User).first():
            print("Тестовые данные уже существуют!")
            return
        
        print("Создание тестовых пользователей...")
        
        # Создание пользователей
        admin = User(
            name="Администратор",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        db.add(admin)
        
        manager1 = User(
            name="Иван Менеджер",
            email="manager@example.com",
            hashed_password=get_password_hash("manager123"),
            role=UserRole.MANAGER
        )
        db.add(manager1)
        
        manager2 = User(
            name="Анна Петрова",
            email="anna@example.com",
            hashed_password=get_password_hash("anna123"),
            role=UserRole.MANAGER
        )
        db.add(manager2)
        
        user1 = User(
            name="Петр Сотрудник",
            email="user@example.com",
            hashed_password=get_password_hash("user123"),
            role=UserRole.USER
        )
        db.add(user1)
        
        db.commit()
        db.refresh(admin)
        db.refresh(manager1)
        db.refresh(manager2)
        db.refresh(user1)
        
        print("Создание тестовых клиентов...")
        
        # Создание клиентов
        clients_data = [
            {
                "name": "ООО Рога и Копыта",
                "email": "info@rogaikopyta.ru",
                "phone": "+7 (495) 123-45-67",
                "company": "ООО Рога и Копыта",
                "address": "Москва, ул. Примерная, д. 1",
                "comment": "Крупный клиент, работаем уже 2 года"
            },
            {
                "name": "Иван Иванов",
                "email": "ivan@example.com",
                "phone": "+7 (916) 555-01-23",
                "company": "ИП Иванов И.И.",
                "address": "Санкт-Петербург, пр. Невский, д. 100",
                "comment": "Частный предприниматель, интересуется IT-услугами"
            },
            {
                "name": "Мария Сидорова",
                "email": "maria@techcorp.ru",
                "phone": "+7 (812) 987-65-43",
                "company": "ТехКорп",
                "address": "Екатеринбург, ул. Ленина, д. 50",
                "comment": "Технический директор, принимает решения быстро"
            },
            {
                "name": "Алексей Петров",
                "email": "alex@startup.io",
                "phone": "+7 (903) 111-22-33",
                "company": "Стартап Инновации",
                "address": "Новосибирск, ул. Красный проспект, д. 25",
                "comment": "Молодая компания, ограниченный бюджет"
            }
        ]
        
        clients = []
        for client_data in clients_data:
            client = Client(**client_data)
            db.add(client)
            clients.append(client)
        
        db.commit()
        for client in clients:
            db.refresh(client)
        
        print("Создание тестовых сделок...")
        
        # Создание сделок
        deals_data = [
            {
                "title": "Внедрение CRM системы",
                "amount": 250000.0,
                "status": DealStatus.IN_PROGRESS,
                "description": "Полное внедрение CRM системы с интеграциями",
                "client_id": clients[0].id,
                "manager_id": manager1.id
            },
            {
                "title": "Разработка сайта",
                "amount": 85000.0,
                "status": DealStatus.NEW,
                "description": "Корпоративный сайт с каталогом товаров",
                "client_id": clients[1].id,
                "manager_id": manager2.id
            },
            {
                "title": "Техническая поддержка",
                "amount": 15000.0,
                "status": DealStatus.WON,
                "description": "Ежемесячная техническая поддержка",
                "client_id": clients[2].id,
                "manager_id": manager1.id
            },
            {
                "title": "Консультация по IT",
                "amount": 5000.0,
                "status": DealStatus.LOST,
                "description": "Консультация по выбору IT решений",
                "client_id": clients[3].id,
                "manager_id": manager2.id
            }
        ]
        
        deals = []
        for deal_data in deals_data:
            deal = Deal(**deal_data)
            db.add(deal)
            deals.append(deal)
        
        db.commit()
        for deal in deals:
            db.refresh(deal)
        
        print("Создание тестовых задач...")
        
        # Создание задач
        tasks_data = [
            {
                "title": "Подготовить презентацию для клиента",
                "description": "Создать презентацию возможностей CRM системы для ООО Рога и Копыта",
                "status": TaskStatus.IN_PROGRESS,
                "deadline": datetime.now() + timedelta(days=3),
                "assigned_user_id": manager1.id
            },
            {
                "title": "Провести демонстрацию системы",
                "description": "Онлайн демонстрация функций CRM для потенциального клиента",
                "status": TaskStatus.TODO,
                "deadline": datetime.now() + timedelta(days=7),
                "assigned_user_id": manager2.id
            },
            {
                "title": "Написать техническое задание",
                "description": "ТЗ на разработку интеграции с 1С",
                "status": TaskStatus.DONE,
                "deadline": datetime.now() - timedelta(days=1),
                "assigned_user_id": user1.id
            },
            {
                "title": "Обновить документацию API",
                "description": "Добавить описание новых методов в документацию",
                "status": TaskStatus.TODO,
                "deadline": datetime.now() + timedelta(days=14),
                "assigned_user_id": user1.id
            },
            {
                "title": "Провести обучение пользователей",
                "description": "Обучить сотрудников клиента работе с новой системой",
                "status": TaskStatus.TODO,
                "deadline": datetime.now() + timedelta(days=21),
                "assigned_user_id": manager1.id
            }
        ]
        
        tasks = []
        for task_data in tasks_data:
            task = Task(**task_data)
            db.add(task)
            tasks.append(task)
        
        db.commit()
        
        print("Создание записей логов...")
        
        # Создание записей логов
        logs_data = [
            {
                "user_id": admin.id,
                "action": "create",
                "entity_type": "client",
                "entity_id": clients[0].id,
                "details": json.dumps({"name": clients[0].name, "company": clients[0].company})
            },
            {
                "user_id": manager1.id,
                "action": "create",
                "entity_type": "deal",
                "entity_id": deals[0].id,
                "details": json.dumps({"title": deals[0].title, "amount": deals[0].amount})
            },
            {
                "user_id": manager2.id,
                "action": "update",
                "entity_type": "deal",
                "entity_id": deals[1].id,
                "details": json.dumps({"old_status": "new", "new_status": "in_progress"})
            }
        ]
        
        for log_data in logs_data:
            log = ActionLog(**log_data)
            db.add(log)
        
        db.commit()
        
        print("✅ Тестовые данные успешно созданы!")
        print("\n📋 Тестовые аккаунты:")
        print("👤 Администратор: admin@example.com / admin123")
        print("👤 Менеджер: manager@example.com / manager123")
        print("👤 Анна Петрова: anna@example.com / anna123")
        print("👤 Пользователь: user@example.com / user123")
        print(f"\n📊 Создано:")
        print(f"   • Пользователей: {len([admin, manager1, manager2, user1])}")
        print(f"   • Клиентов: {len(clients)}")
        print(f"   • Сделок: {len(deals)}")
        print(f"   • Задач: {len(tasks)}")
        
    except Exception as e:
        print(f"❌ Ошибка при создании тестовых данных: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()