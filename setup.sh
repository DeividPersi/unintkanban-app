#!/bin/bash

echo "🚀 Setting up Kanban App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/data
mkdir -p frontend/node_modules

# Set permissions
echo "🔐 Setting permissions..."
chmod +x setup.sh

echo "🏗️ Building and starting containers..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000/api"
echo "   Admin: http://localhost:8000/admin"
echo ""
echo "📚 Documentation:"
echo "   README.md - General information"
echo "   MANUAL_USUARIO.md - User manual"
echo "   INSTRUCOES_EXECUCAO.md - Execution instructions"
echo ""
echo "🛠️ Useful commands:"
echo "   docker-compose logs -f    # View logs"
echo "   docker-compose down       # Stop services"
echo "   docker-compose restart    # Restart services"
echo ""
echo "Happy coding! 🚀"
