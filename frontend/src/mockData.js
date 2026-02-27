// Mock data for Skapeta Apartments - will be replaced by backend API calls

export const apartmentsData = [
  {
    id: 1,
    name: "Deluxe Mountain View Apartment",
    description: "Recently renovated apartment with stunning mountain views. Features air conditioning, free WiFi, fully equipped kitchen with microwave, toaster, tea and coffee facilities. Private bathroom with free toiletries, satellite flat-screen TV, and comfortable sitting area.",
    price: "€45",
    priceUnit: "per night",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1502672260066-6bc35f0af07e?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ],
    available: true,
    capacity: "2-4 guests"
  },
  {
    id: 2,
    name: "Cozy Studio with Balcony",
    description: "Comfortable studio apartment with private balcony overlooking the mountains. Includes air conditioning, heating, washing machine, ironing facilities, and fully equipped kitchen. Perfect for couples or small families.",
    price: "€40",
    priceUnit: "per night",
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
      "https://images.unsplash.com/photo-1571508601936-a81c4ec8e3d9?w=800",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"
    ],
    available: true,
    capacity: "2 guests"
  },
  {
    id: 3,
    name: "Family Apartment with Kitchen",
    description: "Spacious family apartment with dining area, fully equipped kitchen, satellite TV, and modern amenities. Features free WiFi, air conditioning, private bathroom, and comfortable living space for the whole family.",
    price: "€55",
    priceUnit: "per night",
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"
    ],
    available: true,
    capacity: "4-6 guests"
  },
  {
    id: 4,
    name: "Premium Sea View Suite",
    description: "Our premium suite with breathtaking views. Includes all modern amenities: air conditioning, free WiFi, fully equipped kitchen, private bathroom, satellite TV, balcony, and elevator access. Recently renovated with attention to detail.",
    price: "€65",
    priceUnit: "per night",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
    ],
    available: true,
    capacity: "2-4 guests"
  }
];

export const galleryImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"
];

export const foodImages = [
  "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800"
];

export const sightseeingData = [
  {
    id: 1,
    name: "Blue Eye (Syri i Kaltër)",
    description: "A stunning natural spring with crystal-clear blue water, located about 30 minutes from Saranda. One of Albania's most beautiful natural wonders.",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800"
  },
  {
    id: 2,
    name: "Ksamil Beach",
    description: "Paradise beaches with white sand and turquoise waters. Perfect for swimming and relaxation, just 20 minutes from Saranda.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
  },
  {
    id: 3,
    name: "Butrint National Park",
    description: "UNESCO World Heritage Site featuring ancient Greek and Roman ruins in a beautiful natural setting. A must-visit for history lovers.",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
  },
  {
    id: 4,
    name: "Lëkurësi Castle",
    description: "Historic castle overlooking Saranda bay, offering panoramic views of the city, coastline, and sunset. Features a restaurant with traditional Albanian cuisine.",
    image: "https://images.unsplash.com/photo-1520768424566-f588a7ac9e10?w=800"
  }
];

export const translations = {
  en: {
    hero: {
      title: "Skapeta Apartments",
      subtitle: "3-star apartments in Saranda.\nLocated 8–10 minutes walk to the city center,\n3–5 minutes walk to the beach.",
      bookNow: "Book Now",
      whatsapp: "WhatsApp"
    },
    nav: {
      home: "Home",
      about: "About",
      apartments: "Apartments",
      food: "Food Service",
      location: "Location",
      sightseeing: "Sightseeing",
      contact: "Contact"
    },
    about: {
      title: "Welcome to Skapeta Apartments",
      description: "Experience comfort and hospitality in the heart of Saranda. Our recently renovated 3-star apartments offer modern amenities, stunning mountain views, and a perfect location just minutes from the beach and city center. Each apartment features air conditioning, free WiFi, fully equipped kitchen, and private bathroom with all the comforts of home.",
      sarandaTitle: "Discover Saranda",
      sarandaDescription: "Saranda is a beautiful coastal city in southern Albania, known for its stunning beaches, crystal-clear waters, and vibrant nightlife. Located on the Albanian Riviera, Saranda offers the perfect blend of natural beauty, rich history, and modern tourism facilities. Enjoy Mediterranean climate, explore ancient ruins at Butrint, visit the famous Blue Eye natural spring, or simply relax on pristine beaches. With numerous restaurants, cafes, and entertainment options, Saranda is the ideal destination for your vacation."
    },
    apartments: {
      title: "Our Active Apartments",
      perNight: "per night",
      guests: "guests",
      available: "Available",
      bookNow: "Book This Apartment"
    },
    media: {
      title: "Gallery",
      videoTitle: "Experience Skapeta"
    },
    food: {
      title: "Food Service",
      description: "We also offer breakfast, lunch, and dinner service for our guests.",
      quality: "All meals are prepared with love, care, and quality ingredients.",
      menuTitle: "Our Menu"
    },
    location: {
      title: "Location",
      description: "Skapeta Apartments is perfectly located in Saranda, just 400 meters from the main beach and a short walk to the city center. Free parking available.",
      viewMap: "View on Google Maps"
    },
    sightseeing: {
      title: "Things to Do in Saranda"
    },
    contact: {
      title: "Get in Touch",
      instagram: "Follow on Instagram",
      booking: "Book on Booking.com",
      whatsapp: "Chat on WhatsApp",
      maps: "View on Google Maps"
    },
    qrcode: {
      title: "Scan to Visit Our Website",
      download: "Download QR Code"
    },
    footer: {
      address: "Saranda, Albania",
      phone: "+355 69 322 7207",
      rights: "All rights reserved."
    }
  },
  al: {
    hero: {
      title: "Apartamentet Skapeta",
      subtitle: "Apartamente 3-yje në Sarandë.\nNdodhen 8–10 minuta në këmbë nga qendra e qytetit,\n3–5 minuta në këmbë nga plazhi.",
      bookNow: "Rezervo Tani",
      whatsapp: "WhatsApp"
    },
    nav: {
      home: "Ballina",
      about: "Rreth Nesh",
      apartments: "Apartamente",
      food: "Shërbimi i Ushqimit",
      location: "Vendndodhja",
      sightseeing: "Vende për të Vizituar",
      contact: "Kontakti"
    },
    about: {
      title: "Mirë se vini në Apartamentet Skapeta",
      description: "Përjetoni rehatinë dhe mikpritjen në zemër të Sarandës. Apartamentet tona të rinovuara kohët e fundit 3-yje ofrojnë komoditet moderne, pamje mahnitëse të maleve dhe një vendndodhje të përsosur vetëm disa minuta nga plazhi dhe qendra e qytetit. Çdo apartament ka ajër të kondicionuar, WiFi falas, kuzhinë të pajisur plotësisht dhe banjo private me të gjitha komoditetet e shtëpisë.",
      sarandaTitle: "Zbuloni Sarandën",
      sarandaDescription: "Saranda është një qytet i bukur bregdetar në jug të Shqipërisë, i njohur për plazhet e tij mahnitëse, ujërat kristal dhe jetën e natës vibrante. E vendosur në Rivierën Shqiptare, Saranda ofron përzierjen e përsosur të bukurisë natyrore, historisë së pasur dhe lehtësirave moderne turistike. Shijoni klimën mesdhetare, eksploroni rrënojat e lashta në Butrint, vizitoni burimin e famshëm natyror të Syrit të Kaltër, ose thjesht relaksohuni në plazhe të paprekura."
    },
    apartments: {
      title: "Apartamentet Tona Aktive",
      perNight: "për natë",
      guests: "mysafirë",
      available: "I Disponueshëm",
      bookNow: "Rezervo Këtë Apartament"
    },
    media: {
      title: "Galeria",
      videoTitle: "Përjetoni Skapeta"
    },
    food: {
      title: "Shërbimi i Ushqimit",
      description: "Ne gjithashtu ofrojmë shërbim mëngjesi, dreke dhe darke për mysafirët tanë.",
      quality: "Të gjitha vakteve përgatiten me dashuri, kujdes dhe përbërës cilësorë.",
      menuTitle: "Menuja Jonë"
    },
    location: {
      title: "Vendndodhja",
      description: "Apartamentet Skapeta ndodhen në një vendndodhje të përsosur në Sarandë, vetëm 400 metra nga plazhi kryesor dhe një shëtitje e shkurtër në qendrën e qytetit. Parking falas i disponueshëm.",
      viewMap: "Shikoni në Google Maps"
    },
    sightseeing: {
      title: "Gjëra për të Bërë në Sarandë"
    },
    contact: {
      title: "Na Kontaktoni",
      instagram: "Ndiqni në Instagram",
      booking: "Rezervoni në Booking.com",
      whatsapp: "Bisedoni në WhatsApp",
      maps: "Shikoni në Google Maps"
    },
    qrcode: {
      title: "Skanoni për të Vizituar Faqen Tonë",
      download: "Shkarkoni Kodin QR"
    },
    footer: {
      address: "Sarandë, Shqipëri",
      phone: "+355 69 322 7207",
      rights: "Të gjitha të drejtat e rezervuara."
    }
  }
};
