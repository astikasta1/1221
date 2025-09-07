#!/bin/bash

echo "🚀 Запуск CRM системы..."

# Проверка установки Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 не найден. Установите Python 3.8 или выше."
    exit 1
fi

# Проверка установки Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 16 или выше."
    exit 1
fi

echo "📦 Установка зависимостей бэкенда..."
cd backend
python3 -m pip install -r requirements.txt

echo "🗄️ Создание тестовых данных..."
python3 create_test_data.py

echo "🖥️ Запуск бэкенда..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

cd ../frontend

echo "📦 Установка зависимостей фронтенда..."
npm install

echo "🌐 Запуск фронтенда..."
npm start &
FRONTEND_PID=$!

echo "✅ CRM система запущена!"
echo "🔗 Фронтенд: http://localhost:3000"
echo "🔗 API документация: http://localhost:8000/docs"
echo ""
echo "📋 Тестовые аккаунты:"
echo "👤 Администратор: admin@example.com / admin123"
echo "👤 Менеджер: manager@example.com / manager123"
echo ""
echo "⏹️  Для остановки нажмите Ctrl+C"

# Функция для остановки процессов
cleanup() {
    echo ""
    echo "🛑 Остановка сервисов..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Сервисы остановлены"
    exit 0
}

# Обработчик сигнала прерывания
trap cleanup SIGINT SIGTERM

# Ожидание завершения процессов
wait