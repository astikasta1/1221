from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from decouple import config
import uvicorn

from .database import engine, Base
from .routers import auth, clients, deals, tasks, users, logs

# Создание таблиц
Base.metadata.create_all(bind=engine)

# Создание приложения FastAPI
app = FastAPI(
    title="CRM System API",
    description="API для CRM системы с управлением клиентами, сделками и задачами",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Фронтенд
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(auth.router, prefix="/api")
app.include_router(clients.router, prefix="/api")
app.include_router(deals.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(logs.router, prefix="/api")

@app.get("/")
async def root():
    """Перенаправление на документацию API"""
    return RedirectResponse(url="/docs")

@app.get("/health")
async def health_check():
    """Проверка состояния сервиса"""
    return {"status": "healthy", "message": "CRM System API is running"}

if __name__ == "__main__":
    port = config("PORT", default=8000, cast=int)
    debug = config("DEBUG", default=True, cast=bool)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=debug
    )