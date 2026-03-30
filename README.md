# Skapeta Apartments

Luxury Property Management & Restaurant System

## 🚀 Quick Start

### Development Mode

```bash
# Run the setup script
./setup.sh

# Or manually with Docker Compose
docker-compose up -d
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 🛠️ Backend API: http://localhost:8001/docs
- 👑 Admin Panel: http://localhost:3000/admin/login

**Default Credentials:**
- Email: `admin@skapeta.com`
- Password: `admin123`

---

## 📚 Documentation

For detailed deployment instructions, see:
- [Deployment Guide](./README_DEPLOYMENT.md)
- [Docker Setup](#docker-setup)
- [VSCode Setup](#vscode-development)

---

## ✨ Features

### 🏘️ Property Management
- Apartment listings with gallery
- Booking.com integration
- Monthly revenue reports

### 🍴 Food Service
- Customer ordering system
- Real-time order tracking
- WhatsApp notifications
- Admin order management

### 📊 Admin Dashboard
- Order statistics
- Revenue tracking
- Menu management
- Customer management

---

## 🖥️ Technology Stack

**Frontend:**
- React 18
- Tailwind CSS
- shadcn/ui
- React Router

**Backend:**
- FastAPI (Python 3.11)
- MongoDB
- Motor (async MongoDB driver)
- JWT Authentication

**Deployment:**
- Docker & Docker Compose
- Nginx
- Let's Encrypt SSL

---

## 🐳 Docker Setup

### Development

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## 💻 VSCode Development

### Prerequisites

1. Install recommended extensions (VSCode will prompt)
2. Python 3.11+
3. Node.js 18+
4. MongoDB (local or Docker)

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Setup

```bash
cd frontend
yarn install
yarn start
```

### Debug in VSCode

Press `F5` and select:
- **Backend: FastAPI** - Runs backend with debugger
- **Frontend: React** - Runs frontend with debugger
- **Full Stack** - Runs both simultaneously

---

## 🌍 Environment Variables

Create `.env` file (see `.env.example`):

```env
# Backend
MONGO_URL=mongodb://admin:password@localhost:27017/
DB_NAME=skapeta_db
SECRET_KEY=your-secret-key-here
OWNER_WHATSAPP=355693227207

# Frontend
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🛠️ Useful Commands

### Docker

```bash
# Rebuild specific service
docker-compose up -d --build backend

# View specific service logs
docker-compose logs -f backend

# Execute command in container
docker exec -it skapeta_backend bash

# Database backup
docker exec skapeta_mongodb mongodump --out /backup
```

### MongoDB

```bash
# Connect to MongoDB shell
docker exec -it skapeta_mongodb mongosh -u admin -p skapeta_admin_2024

# Show databases
show dbs

# Use database
use skapeta_db

# Show collections
show collections
```

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
yarn test
```

---

## 🚀 Deployment Platforms

### Recommended Platforms

1. **DigitalOcean App Platform**
   - Easy deployment
   - Managed MongoDB
   - Auto-scaling

2. **Railway.app**
   - Free tier
   - Auto-deploy from Git
   - Built-in PostgreSQL/MongoDB

3. **Render.com**
   - Free tier available
   - Continuous deployment
   - Custom domains

4. **Cloudflare Pages + Workers**
   - Frontend on Pages
   - Backend on Workers (requires rewrite)
   - Global CDN

See [Deployment Guide](./README_DEPLOYMENT.md) for detailed instructions.

---

## 📝 Project Structure

```
skapeta-apartments/
├── backend/
│   ├── routes/          # API endpoints
│   ├── models.py        # Pydantic models
│   ├── server.py        # FastAPI app
│   ├── auth.py          # JWT authentication
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── context/     # React Context
│   └── package.json
├── nginx/
│   └── nginx.conf
├── .vscode/         # VSCode settings
├── docker-compose.yml
├── docker-compose.prod.yml
└── setup.sh
```

---

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variable protection
- SQL injection prevention (NoSQL)
- XSS protection headers

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 💬 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@skapeta.com

---

## 📝 License

MIT License - See LICENSE file for details

---

## ❤️ Credits

Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
