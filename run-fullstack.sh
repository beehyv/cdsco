#!/bin/bash

# FSSAI Full Stack Docker Commands
echo "🚀 FSSAI Full Stack Application"
echo "==============================="
echo ""

case "$1" in
    start)
        echo "🔨 Building and starting both frontend and backend..."
        docker-compose up --build -d
        echo ""
        echo "✅ Services started!"
        echo "📱 Frontend: http://localhost:5173"
        echo "🔧 Backend: http://localhost:8000"
        echo "📚 API Docs: http://localhost:8000/docs"
        ;;
    stop)
        echo "⏹️ Stopping all services..."
        docker-compose down
        echo "✅ All services stopped!"
        ;;
    restart)
        echo "🔄 Restarting all services..."
        docker-compose down
        docker-compose up --build -d
        echo "✅ Services restarted!"
        ;;
    logs)
        echo "📜 Showing logs..."
        docker-compose logs -f
        ;;
    status)
        echo "📋 Service status:"
        docker-compose ps
        ;;
    clean)
        echo "🧹 Cleaning up..."
        docker-compose down -v --rmi all
        echo "✅ Cleanup complete!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  start    - Build and start both services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show service logs"
        echo "  status   - Show service status"
        echo "  clean    - Stop and remove everything"
        echo ""
        echo "Examples:"
        echo "  ./run-fullstack.sh start"
        echo "  ./run-fullstack.sh logs"
        echo "  ./run-fullstack.sh stop"
        ;;
esac
