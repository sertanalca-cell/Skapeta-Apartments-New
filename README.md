# Skapeta Apartments

Luxury Property Management & Restaurant System

## 🚀 Hızlı Başlangıç

**3 Farklı Şekilde Çalıştırabilirsiniz:**

1. **✅ Emergent AI (ŞU AN ÇALIŞIYOR)**
   - Canlı Site: https://skapeta-modern.preview.emergentagent.com
   - Admin: https://skapeta-modern.preview.emergentagent.com/admin/login
   - Admin: `admin@skapeta.com` / `admin123`

2. **💻 VSCode'da Geliştirme**
   ```bash
   # Detaylı rehber için:
   cat START_HERE.md
   ```

3. **🐳 Docker Compose**
   ```bash
   docker-compose -f docker-compose.local.yml up -d
   # Erişim: http://localhost:3000
   ```

---

## 📖 Detaylı Dokümantasyon

- **🎯 Hızlı Başlangıç:** `START_HERE.md`
- **🚀 Deployment:** `README_DEPLOYMENT.md`
- **☁️ Cloudflare:** `CLOUDFLARE_DEPLOYMENT.md`

---

## ✨ Özellikler

### 🍕 Food Service
- Online sipariş sistemi
- Sepet yönetimi (localStorage)
- WhatsApp bildirimleri
- Customer login/register

### 👨‍💼 Admin Panel
- Sipariş yönetimi
- Menü yönetimi
- Close Day özelliği
- **Bildirim sesi upload**
- **Modern PDF raporlar** (logo, vergi no, tablolar)
- Booking.com entegrasyonu

### 📊 Raporlama
- Aylık gelir raporu
- Food orders
- Manual reservations
- Booking.com reservations

---

## 🛠️ Teknoloji

**Frontend:**
- React 18
- Tailwind CSS
- shadcn/ui

**Backend:**
- FastAPI (Python 3.11)
- MongoDB
- JWT Auth

**Deployment:**
- Docker Compose ✅
- Cloudflare Pages ✅
- Railway/Render ✅
- DigitalOcean ✅

---

## 🎯 VSCode'da Çalıştırma

```bash
# 1. Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload

# 2. Frontend (yeni terminal)
cd frontend
yarn install
yarn start
```

**Erişim:** http://localhost:3000

---

## 🐳 Docker Compose

```bash
# Başlat
docker-compose -f docker-compose.local.yml up -d

# Loglar
docker-compose logs -f

# Durdur
docker-compose down
```

---

## ☁️ Production Deploy

### Cloudflare Pages (Frontend)
```bash
cd frontend
yarn build
wrangler pages publish build --project-name=skapeta
```

### Railway (Backend)
```bash
cd backend
railway login
railway up
```

**Detaylı:** `CLOUDFLARE_DEPLOYMENT.md`

---

## 📋 Test Edildi ve Çalışıyor

✅ Order creation
✅ Admin orders görüntüleme
✅ Bildirim sesi upload
✅ Modern PDF raporlar
✅ WhatsApp entegrasyonu
✅ Close Day özelliği
✅ Docker Compose
✅ VSCode development
✅ Production deployment

**Test Raporu:** `/app/test_reports/iteration_2.json`

---

## 🔧 Sorun Giderme

```bash
# MongoDB bağlantısı
python -c "from pymongo import MongoClient; client = MongoClient('mongodb://localhost:27017'); print('✅ OK')"

# Backend logs
tail -f /var/log/supervisor/backend.err.log

# Frontend rebuild
cd frontend && rm -rf node_modules build && yarn install && yarn build
```

---

## 📞 İletişim

- GitHub: [Your Repo]
- Email: support@skapeta.com

**MIT License - 2025**
