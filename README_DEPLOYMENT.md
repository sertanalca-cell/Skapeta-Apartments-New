# Skapeta Apartments - Deployment Guide

## 🚀 Quick Start with Docker Compose

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 1. Local Development with Docker

```bash
# Clone the repository
git clone <your-repo-url>
cd skapeta-apartments

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- Admin Panel: http://localhost:3000/admin/login
- MongoDB: localhost:27017

**Default Admin Credentials:**
- Email: admin@skapeta.com
- Password: admin123

---

## 🌐 Cloudflare Deployment

### Option 1: Cloudflare Pages (Frontend) + Cloudflare Workers (Backend)

#### Frontend Deployment

1. **Build the frontend:**
```bash
cd frontend
yarn build
```

2. **Deploy to Cloudflare Pages:**
- Go to Cloudflare Dashboard → Pages
- Connect your Git repository
- Build settings:
  - Build command: `cd frontend && yarn build`
  - Build output directory: `frontend/build`
  - Environment variables:
    - `REACT_APP_BACKEND_URL`: Your backend URL

#### Backend Deployment

**Note:** FastAPI requires a full Python runtime. For Cloudflare, consider:
- Use Cloudflare Workers with Hono.js (Node.js backend rewrite)
- OR deploy backend to:
  - Railway.app
  - Render.com
  - DigitalOcean App Platform
  - AWS Lambda + API Gateway

---

## 🐳 Production Docker Deployment

### 1. Using Docker Compose (Recommended)

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Environment Variables

Update `.env` with production values:

```env
MONGO_URL=mongodb://admin:STRONG_PASSWORD@mongodb:27017/
DB_NAME=skapeta_production
SECRET_KEY=GENERATE_STRONG_SECRET_KEY_HERE
OWNER_WHATSAPP=355693227207
REACT_APP_BACKEND_URL=https://your-domain.com
```

### 3. SSL/TLS Setup with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already set up)
sudo certbot renew --dry-run
```

---

## 📱 VSCode Development Setup

### 1. Install Extensions
- Python
- Pylance
- ESLint
- Prettier
- Docker
- MongoDB for VS Code

### 2. Workspace Setup

Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 3. Run Backend in VSCode

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 4. Run Frontend in VSCode

```bash
cd frontend
yarn install
yarn start
```

---

## 🔧 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB status
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB shell
docker exec -it skapeta_mongodb mongosh -u admin -p skapeta_admin_2024
```

### Backend Not Starting

```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Frontend Build Issues

```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules build
yarn install
yarn build
```

---

## 📊 Database Management

### Backup MongoDB

```bash
# Backup
docker exec skapeta_mongodb mongodump --username admin --password skapeta_admin_2024 --authenticationDatabase admin --out /backup

# Restore
docker exec skapeta_mongodb mongorestore --username admin --password skapeta_admin_2024 --authenticationDatabase admin /backup
```

### Seed Initial Data

```bash
cd backend
python seed_data.py
```

---

## 🌍 Supported Deployment Platforms

1. **DigitalOcean** (Recommended)
   - App Platform
   - Droplet with Docker

2. **Railway.app**
   - Easy deployment
   - Auto-scaling

3. **Render.com**
   - Free tier available
   - Auto-deploy from Git

4. **AWS**
   - ECS with Fargate
   - EC2 with Docker

5. **Cloudflare Pages + Workers**
   - Frontend on Pages
   - Backend rewrite needed

---

## 📝 License

MIT License - See LICENSE file for details
