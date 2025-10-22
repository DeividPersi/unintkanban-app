@echo off
echo 🚀 Setting up Kanban App...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Create necessary directories
echo 📁 Creating directories...
if not exist "backend\data" mkdir backend\data
if not exist "frontend\node_modules" mkdir frontend\node_modules

echo 🏗️ Building and starting containers...
docker-compose up --build -d

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo 📊 Checking service status...
docker-compose ps

echo.
echo 🎉 Setup complete!
echo.
echo 📱 Access your application:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:8000/api
echo    Admin: http://localhost:8000/admin
echo.
echo 📚 Documentation:
echo    README.md - General information
echo    MANUAL_USUARIO.md - User manual
echo    INSTRUCOES_EXECUCAO.md - Execution instructions
echo.
echo 🛠️ Useful commands:
echo    docker-compose logs -f    # View logs
echo    docker-compose down       # Stop services
echo    docker-compose restart    # Restart services
echo.
echo Happy coding! 🚀
pause
