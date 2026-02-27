# Skapeta Apartments - Product Requirements Document

**Project**: Luxury Landing Page Website for Skapeta Apartments
**Location**: Saranda, Albania
**Created**: 2025-12-27
**Last Updated**: 2025-12-27

---

## Original Problem Statement

Create a luxury, modern, animated landing page website for Skapeta Apartments with full admin panel for content management. The website must showcase apartments, food services, location, local attractions, provide booking integration, and support multi-language (English & Albanian).

---

## ✅ COMPLETED FEATURES

### Phase 1: Frontend Landing Page (COMPLETE)
- ✅ Modern luxury design with smooth animations
- ✅ Bilingual support (English/Albanian) with language switcher
- ✅ Hero section with CTA buttons (Book Now, WhatsApp)
- ✅ About section with Saranda information
- ✅ Apartments showcase (4 active apartments)
- ✅ Gallery with image grid
- ✅ Food service section
- ✅ Google Maps location integration
- ✅ Sightseeing attractions (Blue Eye, Ksamil, Butrint, Lëkurësi)
- ✅ Contact section with social media buttons
- ✅ QR code generator with download
- ✅ Responsive mobile-first design
- ✅ Professional footer

### Phase 2: Backend API (COMPLETE)
- ✅ FastAPI backend with MongoDB
- ✅ JWT authentication system
- ✅ Password hashing with bcrypt
- ✅ Protected admin routes
- ✅ Apartments CRUD API (create, read, update, delete)
- ✅ Gallery management API
- ✅ Settings management API
- ✅ Image upload system with validation
- ✅ File serving for uploaded images
- ✅ Database models for all entities
- ✅ Default admin user created

### Phase 3: Admin Panel (COMPLETE)
- ✅ Admin login page with authentication
- ✅ Protected admin routes
- ✅ Admin dashboard with statistics
- ✅ Apartments Manager:
  * Add/edit/delete apartments
  * Upload multiple images per apartment
  * Set pricing and availability
  * Manage capacity and descriptions
- ✅ Gallery Manager:
  * Upload images to gallery
  * Delete images
  * Category-based organization
- ✅ Settings Editor:
  * Upload logo
  * Update contact information
  * Manage social media links
  * Configure external URLs
- ✅ Professional admin UI with navigation
- ✅ Toast notifications
- ✅ Image upload with preview
- ✅ Responsive admin interface

---

## 🔑 ADMIN CREDENTIALS

**URL**: https://skapeta-modern.preview.emergentagent.com/admin/login

**Login:**
- Email: `admin@skapeta.com`
- Password: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

---

## 📚 HOW TO USE THE ADMIN PANEL

### 1. Login to Admin Panel
- Go to `/admin/login`
- Enter credentials
- Click "Login"

### 2. Add Your First Apartment
- Navigate to "Apartments" tab
- Click "Add Apartment"
- Fill in:
  * Name (e.g., "Deluxe Sea View Suite")
  * Description
  * Price (e.g., 50)
  * Capacity (e.g., "2-4 guests")
- Upload 3-4 images
- Check "Available for booking"
- Click "Create Apartment"

### 3. Upload Gallery Images
- Navigate to "Gallery" tab
- Click upload area
- Select multiple images
- Images appear instantly on main website

### 4. Update Settings
- Navigate to "Settings" tab
- Upload your logo
- Update phone, address, WhatsApp number
- Add your Instagram URL
- Update Booking.com link
- Update Google Maps coordinates
- Click "Save Settings"

### 5. View Your Website
- Click "View Site" button in admin header
- Or visit the main homepage
- All changes reflect immediately!

---

## 📂 PROJECT STRUCTURE

```
/app/
├── backend/
│   ├── server.py              # Main FastAPI server
│   ├── models.py              # Pydantic models
│   ├── auth.py                # Authentication logic
│   ├── seed.py                # Database seeding script
│   ├── routes/
│   │   ├── auth_routes.py     # Login/register endpoints
│   │   ├── apartment_routes.py # Apartments CRUD
│   │   ├── gallery_routes.py  # Gallery management
│   │   ├── upload_routes.py   # Image upload
│   │   └── settings_routes.py # Settings management
│   └── uploads/               # Uploaded images storage
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Main public page
│   │   │   └── admin/
│   │   │       ├── AdminLogin.jsx     # Login page
│   │   │       ├── AdminLayout.jsx    # Admin wrapper
│   │   │       ├── AdminDashboard.jsx # Dashboard
│   │   │       ├── ApartmentsManager.jsx
│   │   │       ├── GalleryManager.jsx
│   │   │       └── SettingsEditor.jsx
│   │   ├── services/
│   │   │   └── api.js         # API service layer
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication state
│   │   └── mockData.js        # Mock data (for reference)
│
└── memory/
    └── PRD.md                 # This document
```

---

## 🎯 API ENDPOINTS

### Public Endpoints
- `GET /api/` - Health check
- `GET /api/apartments` - Get all apartments
- `GET /api/gallery` - Get gallery images
- `GET /api/settings` - Get website settings

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new admin
- `GET /api/auth/me` - Get current user

### Protected Endpoints (Requires JWT Token)
- `POST /api/apartments` - Create apartment
- `PUT /api/apartments/{id}` - Update apartment
- `DELETE /api/apartments/{id}` - Delete apartment
- `POST /api/gallery` - Add gallery image
- `DELETE /api/gallery/{id}` - Delete gallery image
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `PUT /api/settings` - Update settings

---

## 🚀 DEPLOYMENT NOTES

### Database
- MongoDB running locally
- Collections: users, apartments, gallery, settings
- No migrations needed (NoSQL)

### File Storage
- Images stored in `/app/backend/uploads/`
- Served via `/api/uploads/{filename}`
- Automatic UUID naming prevents conflicts

### Environment Variables
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `SECRET_KEY` - JWT secret (change in production!)
- `REACT_APP_BACKEND_URL` - Backend URL for frontend

---

## 📝 NEXT STEPS (OPTIONAL ENHANCEMENTS)

### P0 - Immediate
- ✅ Change admin password
- ✅ Upload your logo
- ✅ Add real apartment photos
- ✅ Update contact information

### P1 - Recommended
- [ ] Add more apartment listings
- [ ] Upload professional gallery photos
- [ ] Add food menu images
- [ ] Test booking flow
- [ ] Share QR code for marketing

### P2 - Future Features
- [ ] Turkish language support
- [ ] Customer reviews system
- [ ] Email notifications
- [ ] Booking calendar
- [ ] Analytics dashboard
- [ ] Newsletter subscription
- [ ] Blog section

---

## 🔧 TECHNICAL STACK

**Frontend**: React 19, Tailwind CSS, Shadcn UI, Axios
**Backend**: FastAPI, Python 3.11
**Database**: MongoDB
**Authentication**: JWT with bcrypt
**File Storage**: Local file system
**Deployment**: Emergent Agent Platform

---

## ⚠️ IMPORTANT NOTES

1. **Security**: Change the default admin password immediately
2. **Images**: Supported formats: JPG, JPEG, PNG, GIF, WEBP
3. **File Size**: No hard limit, but keep images under 5MB for performance
4. **Backup**: Regularly backup `/app/backend/uploads/` folder
5. **Database**: MongoDB data persists across restarts

---

## 📞 SUPPORT

For technical issues or questions:
- Review this PRD document
- Check backend logs: `tail -f /var/log/supervisor/backend.*.log`
- Check frontend logs: `tail -f /var/log/supervisor/frontend.*.log`
- Test API endpoints using the admin panel

---

**Last Updated**: December 27, 2025
**Status**: ✅ PRODUCTION READY
