# Skapeta Apartments - Product Requirements Document

**Project**: Luxury Landing Page Website for Skapeta Apartments
**Location**: Saranda, Albania
**Created**: 2025-12-27
**Last Updated**: 2025-12-27

---

## Original Problem Statement

Create a luxury, modern, animated landing page website for Skapeta Apartments, a 3-star accommodation in Saranda, Albania. The website must showcase apartments, food services, location, local attractions, and provide booking integration with multi-language support (English & Albanian).

---

## User Personas

1. **International Tourists** - Seeking quality accommodation in Saranda, need English interface
2. **Albanian Visitors** - Local tourists preferring Albanian language interface
3. **Repeat Guests** - Looking for direct contact via WhatsApp or booking channels
4. **Property Admins** - Need to manage content, images, and apartment details

---

## Core Requirements

### Design Requirements
- ✅ Modern, luxury hotel-style design
- ✅ Positive, clean color scheme (sky blue, white, slate)
- ✅ Smooth animations and transitions
- ✅ Mobile-first, fully responsive design
- ✅ Premium hotel feeling with elegant hover effects

### Functional Requirements
- ✅ Multi-language support (English & Albanian)
- ✅ Smooth section navigation
- ✅ External integrations (Booking.com, WhatsApp, Instagram, Google Maps)
- ✅ QR code generator for website sharing
- ✅ Image galleries with navigation
- 🔄 Admin panel for content management (Pending)
- 🔄 Real image upload functionality (Pending)
- 🔄 Database storage for apartments and media (Pending)

---

## What's Been Implemented (Phase 1 - Frontend MVP)

### ✅ Completed - December 27, 2025

1. **Hero Section**
   - Logo placeholder (blue gradient with "S")
   - Main title and subtitle
   - "Book Now" button (links to Booking.com)
   - "WhatsApp" button (opens WhatsApp chat +355693227207)

2. **Navigation**
   - Fixed header with smooth scroll
   - Language switcher (EN/AL)
   - Responsive navigation menu
   - Section links (Home, About, Apartments, Food Service, Location, Contact)

3. **About Section**
   - Welcome text with apartment description (from Booking.com)
   - Feature highlights (WiFi, AC, Kitchen, Parking)
   - Saranda city information
   - Professional imagery

4. **Apartments Section**
   - 4 active apartments displayed
   - Each apartment card includes:
     * Name and description (from Booking.com data)
     * Price display (€40-€65 per night)
     * Guest capacity
     * Image carousel (3-4 images per apartment)
     * "Available" badge
     * "Book This Apartment" button

5. **Media Gallery**
   - 6 high-quality placeholder images
   - Responsive grid layout (2 columns mobile, 3 desktop)
   - Hover effects with zoom transitions

6. **Food Service Section**
   - Service description text
   - Quality statement
   - 4 food images in grid layout

7. **Location Section**
   - Google Maps embed
   - Location description
   - "View on Google Maps" button

8. **Sightseeing Section**
   - 4 attractions featured:
     * Blue Eye (Syri i Kaltër)
     * Ksamil Beach
     * Butrint National Park
     * Lëkurësi Castle
   - Images with descriptions

9. **Contact & QR Section**
   - Instagram button (pink gradient)
   - Booking.com button (blue gradient)
   - WhatsApp button (green gradient)
   - Google Maps button (orange gradient)
   - QR code generator with download functionality

10. **Footer**
    - Logo and tagline
    - Contact information (address, phone)
    - Quick links
    - Copyright notice

11. **Multi-Language System**
    - Complete translations for EN/AL
    - Dynamic content switching
    - All sections translated

### Files Created
- `/app/frontend/src/mockData.js` - Mock data structure for apartments, gallery, food, sightseeing, and translations
- `/app/frontend/src/pages/LandingPage.jsx` - Main landing page component
- `/app/frontend/src/App.js` - Updated routing
- `/app/frontend/src/App.css` - Custom animations and styles

### Dependencies Added
- `qrcode` - QR code generation library

---

## API Contracts (For Phase 2 - Backend Development)

### Apartments Management

**GET /api/apartments**
```json
Response: [
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "priceUnit": "string",
    "images": ["url1", "url2", "url3"],
    "available": "boolean",
    "capacity": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

**POST /api/apartments** (Admin only)
```json
Request: { name, description, price, priceUnit, capacity, available }
Response: { id, ...apartmentData }
```

**PUT /api/apartments/:id** (Admin only)
**DELETE /api/apartments/:id** (Admin only)

### Media Management

**GET /api/gallery**
**POST /api/gallery/upload** (Admin only)
**DELETE /api/gallery/:id** (Admin only)

### Food Menu

**GET /api/food-menu**
**POST /api/food-menu/upload** (Admin only)

### Admin Authentication

**POST /api/auth/login**
```json
Request: { email, password }
Response: { token, user: { id, email, role } }
```

**POST /api/auth/verify**
**POST /api/auth/logout**

---

## Prioritized Backlog

### P0 - Critical (Phase 2)
- [ ] Backend API development with FastAPI
- [ ] MongoDB models for Apartments, Gallery, FoodMenu, Users
- [ ] Image upload functionality with file storage
- [ ] Admin authentication system
- [ ] Admin panel UI for content management
- [ ] Frontend-backend integration
- [ ] Remove mock data, connect to real APIs

### P1 - High Priority
- [ ] User-provided logo integration
- [ ] User-provided apartment images upload
- [ ] Real Google Maps coordinates for Skapeta location
- [ ] Email notification system for bookings
- [ ] Contact form functionality
- [ ] SEO optimization (meta tags, structured data)

### P2 - Nice to Have
- [ ] Turkish language support (TR)
- [ ] Admin dashboard analytics
- [ ] Booking calendar integration
- [ ] Customer reviews section
- [ ] Newsletter subscription
- [ ] Blog section for Saranda travel tips
- [ ] Advanced image optimization
- [ ] Performance monitoring

---

## Next Tasks

1. **Get User Assets**
   - Collect logo file from user
   - Collect real apartment photos
   - Get specific Google Maps coordinates

2. **Backend Development**
   - Set up MongoDB schemas
   - Create CRUD APIs for apartments
   - Implement image upload with multer/file storage
   - Build admin authentication
   - Create admin panel UI

3. **Integration**
   - Connect frontend to backend APIs
   - Replace mock data with real data
   - Test all functionality end-to-end

4. **Testing & Deployment**
   - Full testing with testing_agent_v3
   - Performance optimization
   - Final QA before launch

---

## Technical Stack

**Frontend**: React 19, Tailwind CSS, Shadcn UI, React Router
**Backend**: FastAPI, Python
**Database**: MongoDB
**File Storage**: Local file system (to be configured)
**External Services**: Booking.com, WhatsApp, Google Maps, Instagram

---

## Notes

- Using placeholder images from Unsplash for MVP demonstration
- Apartment descriptions sourced from Booking.com search results
- Logo is currently a placeholder (blue gradient with "S")
- Instagram link uses placeholder username "skapeta_apartments"
- Google Maps location uses general Saranda coordinates (needs exact coordinates)
