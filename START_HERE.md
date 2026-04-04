# 🚀 Skapeta Apartments - Hızlı Başlangıç Rehberi

## Seçenek 1: Emergent AI'da Çalıştırma (ŞU AN ÇALIŞIYOR)

**Canlı Site:**
- Frontend: https://skapeta-modern.preview.emergentagent.com
- Admin: https://skapeta-modern.preview.emergentagent.com/admin/login

**Admin Girişi:**
```
Email: admin@skapeta.com
Şifre: admin123
```

---

## Seçenek 2: VSCode'da Geliştirme

### Gereksinimler:
- Node.js 18+
- Python 3.11+
- MongoDB (lokal veya Atlas)
- Yarn package manager

### Adım 1: Repository'i İndirin
```bash
git clone <your-repo-url>
cd skapeta-apartments
```

### Adım 2: MongoDB'yi Başlatın

**Seçenek A - Lokal MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Seçenek B - Docker ile MongoDB:**
```bash
docker run -d -p 27017:27017 --name skapeta-mongo \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=skapeta_admin_2024 \
  mongo:7.0
```

### Adım 3: Backend Kurulumu
```bash
cd backend

# Virtual environment oluştur
python -m venv .venv

# Activate
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows

# Dependencies yükle
pip install -r requirements.txt

# .env dosyası oluştur
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=skapeta_db
SECRET_KEY=your-secret-key-change-this
OWNER_WHATSAPP=355693227207
EOF

# Database seed
python seed_data.py

# Backend başlat
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Adım 4: Frontend Kurulumu (Yeni Terminal)
```bash
cd frontend

# Dependencies yükle
yarn install

# .env dosyası oluştur
cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

# Frontend başlat
yarn start
```

### Adım 5: Tarayıcıda Aç
- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8001/docs
- Admin Panel: http://localhost:3000/admin/login

---

## Seçenek 3: Docker Compose ile Çalıştırma

### Tek Komut ile Başlatma:
```bash
# Tüm servisleri başlat
docker-compose -f docker-compose.local.yml up -d

# Logları izle
docker-compose -f docker-compose.local.yml logs -f

# Durdur
docker-compose -f docker-compose.local.yml down
```

### Veya Setup Script ile:
```bash
chmod +x setup.sh
./setup.sh
```

**Erişim:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- MongoDB: localhost:27017

---

## Seçenek 4: Cloudflare Pages'te Deploy

### Frontend (Cloudflare Pages)

1. **Frontend Build:**
```bash
cd frontend
yarn build
```

2. **Cloudflare Pages Deploy:**
```bash
# Wrangler yükle
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages publish build --project-name=skapeta-apartments
```

3. **Environment Variables (Cloudflare Dashboard):**
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

### Backend (Railway.app veya Render.com)

**Railway Deployment:**
```bash
# Railway CLI yükle
npm install -g @railway/cli

# Login ve deploy
cd backend
railway login
railway init
railway up
```

**Environment Variables (Railway Dashboard):**
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/skapeta_db
DB_NAME=skapeta_db
SECRET_KEY=production-secret-key
OWNER_WHATSAPP=355693227207
```

**Detaylı Rehber:**
- Bkz: `CLOUDFLARE_DEPLOYMENT.md`
- Bkz: `README_DEPLOYMENT.md`

---

## 🐛 Sorun Giderme

### Backend başlamıyor:
```bash
# Logları kontrol et
tail -f /var/log/supervisor/backend.err.log

# MongoDB bağlantısını test et
python -c "from pymongo import MongoClient; client = MongoClient('mongodb://localhost:27017'); print('✅ Connected')"
```

### Frontend build hatası:
```bash
# Cache temizle
cd frontend
rm -rf node_modules build
yarn install
yarn build
```

### MongoDB bağlantı hatası:
```bash
# Connection string kontrol
echo $MONGO_URL

# MongoDB çalışıyor mu?
mongosh --eval "db.version()"
```

---

## 📚 Daha Fazla Bilgi

- **Ana README:** `README.md`
- **Deployment:** `README_DEPLOYMENT.md`
- **Cloudflare:** `CLOUDFLARE_DEPLOYMENT.md`
- **VSCode Debug:** `.vscode/launch.json`

---

## 🎯 Özet

| Ortam | Komut | Erişim |
|-------|-------|--------|
| **Emergent** | Zaten çalışıyor! | https://skapeta-modern.preview.emergentagent.com |
| **VSCode** | Backend + Frontend ayrı ayrı | http://localhost:3000 |
| **Docker** | `docker-compose up -d` | http://localhost:3000 |
| **Production** | Cloudflare + Railway | Custom domain |

**Başarılar! 🚀**
