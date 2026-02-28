import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  MapPin, Phone, Instagram, MessageCircle, 
  MapIcon, Check, ChevronLeft, ChevronRight,
  Upload, Calendar
} from 'lucide-react';
import { apartmentsAPI, galleryAPI, sightseeingAPI, settingsAPI } from '../services/api';
import { translations } from '../mockData';
import QRCode from 'qrcode';
import { Star } from 'lucide-react';
import { SplashScreen } from '../components/SplashScreen';
import { ThemeToggle } from '../components/ThemeToggle';

export const LandingPage = () => {
  const [language, setLanguage] = useState('en');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [apartments, setApartments] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [sightseeing, setSightseeing] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  
  const t = translations[language];

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apartmentsData, galleryData, sightseeingData, settingsData] = await Promise.all([
          apartmentsAPI.getAll(),
          galleryAPI.getAll(),
          sightseeingAPI.getAll(),
          settingsAPI.get(),
        ]);
        
        setApartments(apartmentsData);
        setGallery(galleryData);
        setSightseeing(sightseeingData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Generate QR code for the website
    const generateQR = async () => {
      try {
        const url = window.location.origin;
        const qr = await QRCode.toDataURL(url, { width: 200 });
        setQrCodeUrl(qr);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };
    generateQR();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageNavigation = (apartmentId, direction) => {
    setCurrentImageIndex(prev => {
      const apartment = apartments.find(a => a.id === apartmentId);
      if (!apartment || apartment.images.length === 0) return prev;
      
      const currentIndex = prev[apartmentId] || 0;
      const maxIndex = apartment.images.length - 1;
      
      if (direction === 'next') {
        return { ...prev, [apartmentId]: currentIndex === maxIndex ? 0 : currentIndex + 1 };
      } else {
        return { ...prev, [apartmentId]: currentIndex === 0 ? maxIndex : currentIndex - 1 };
      }
    });
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} logoUrl={settings?.logo_url} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = 'skapeta-apartments-qr.png';
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-sky-500" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
              )}
              <span className="font-semibold text-xl text-slate-800 dark:text-white">Skapeta</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('home')} className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t.nav.home}</button>
              <button onClick={() => scrollToSection('about')} className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t.nav.about}</button>
              <button onClick={() => scrollToSection('apartments')} className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t.nav.apartments}</button>
              <button onClick={() => scrollToSection('food')} className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t.nav.food}</button>
              <button onClick={() => scrollToSection('location')} className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t.nav.location}</button>
              <button onClick={() => scrollToSection('contact')} className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{t.nav.contact}</button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md transition-all ${language === 'en' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('al')}
                className={`px-3 py-1 rounded-md transition-all ${language === 'al' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                AL
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Hero Background */}
        {settings?.hero_background_url && settings.hero_background_type !== 'none' && (
          <div className="absolute inset-0 z-0">
            {settings.hero_background_type === 'video' ? (
              <video
                src={settings.hero_background_url}
                className="w-full h-full object-cover opacity-20"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={settings.hero_background_url}
                alt="Background"
                className="w-full h-full object-cover opacity-20"
              />
            )}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-slate-50 opacity-70"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-sky-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 inline-block animate-fade-in">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-24 h-24 rounded-full object-cover shadow-2xl mx-auto border-4 border-sky-500" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                  <span className="text-white font-bold text-4xl">S</span>
                </div>
              )}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-slate-900 animate-fade-in">
              {settings?.hero_title || t.hero.title}
            </h1>
            
            {/* Star Rating */}
            {settings?.star_rating > 0 && (
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(settings.star_rating)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            )}
            
            <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed whitespace-pre-line">
              {settings?.hero_subtitle || t.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                onClick={() => window.open(settings?.booking_url || 'https://www.booking.com/hotel/al/pirro-39-s-vacation-home.html', '_blank')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t.hero.bookNow}
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                onClick={() => window.open(`https://wa.me/${settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '355693227207'}`, '_blank')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t.hero.whatsapp}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{settings?.about_title || t.about.title}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <p className="text-lg text-slate-600 leading-relaxed">
                {settings?.about_description || t.about.description}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { icon: <Check className="w-5 h-5" />, text: 'Free WiFi' },
                  { icon: <Check className="w-5 h-5" />, text: 'Air Conditioning' },
                  { icon: <Check className="w-5 h-5" />, text: 'Fully Equipped Kitchen' },
                  { icon: <Check className="w-5 h-5" />, text: 'Free Parking' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700">
                    <div className="text-green-500">{item.icon}</div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={settings?.about_image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"} 
                  alt="Skapeta Apartments"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          {/* Saranda Info */}
          <div className="bg-gradient-to-br from-slate-50 to-sky-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">{t.about.sarandaTitle}</h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              {t.about.sarandaDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Apartments Section */}
      <section id="apartments" className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t.apartments.title}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {apartments.map((apartment) => {
              const currentIdx = currentImageIndex[apartment.id] || 0;
              return (
                <Card key={apartment.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <div className="relative aspect-video group">
                    <img 
                      src={apartment.images[currentIdx]} 
                      alt={apartment.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Image Navigation */}
                    <button 
                      onClick={() => handleImageNavigation(apartment.id, 'prev')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleImageNavigation(apartment.id, 'next')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {apartment.available && (
                      <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                        {t.apartments.available}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{apartment.name}</h3>
                    <p className="text-slate-600 mb-4 line-clamp-3">{apartment.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-3xl font-bold text-sky-600">{apartment.price}</span>
                        <span className="text-slate-500 ml-2">{t.apartments.perNight}</span>
                      </div>
                      <span className="text-slate-500">{apartment.capacity}</span>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                      onClick={() => window.open(settings?.booking_url || 'https://www.booking.com/hotel/al/pirro-39-s-vacation-home.html', '_blank')}
                    >
                      {t.apartments.bookNow}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="media" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t.media.title}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          {gallery.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Gallery coming soon...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.slice(0, 12).map((item, idx) => (
                <div key={item.id || idx} className="relative rounded-xl overflow-hidden shadow-lg group">
                  {item.media_type === 'video' ? (
                    <div className="relative aspect-square bg-slate-900">
                      <video
                        src={item.url}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                        Video
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-square">
                      <img 
                        src={item.url} 
                        alt={item.caption || `Gallery ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                  )}
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
                      <p className="text-white text-sm">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Food Service Section */}
      <section id="food" className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{settings?.food_service_title || t.food.title}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl mb-12">
            <p className="text-xl text-center text-slate-700 mb-6">{settings?.food_service_description || t.food.description}</p>
            <p className="text-lg text-center text-slate-600 italic">{settings?.food_service_subtitle || t.food.quality}</p>
          </div>

          {gallery.filter(img => img.category === 'food').length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.filter(img => img.category === 'food').slice(0, 8).map((img, idx) => (
                <div key={img.id || idx} className="relative aspect-square rounded-xl overflow-hidden shadow-lg group">
                  <img 
                    src={img.url} 
                    alt={img.caption || `Food ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Food gallery coming soon...</p>
            </div>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t.location.title}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <p className="text-lg text-center text-slate-600 mb-8 max-w-3xl mx-auto">
            {t.location.description}
          </p>

          <div className="rounded-2xl overflow-hidden shadow-2xl mb-6">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3061.7662442!2d20.0046!3d39.8753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135b7b7b7b7b7b7b%3A0x7b7b7b7b7b7b7b7b!2sSaranda%2C%20Albania!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
              onClick={() => window.open(settings?.google_maps_url || 'https://maps.google.com/?q=Saranda,Albania', '_blank')}
            >
              <MapIcon className="w-5 h-5 mr-2" />
              {t.location.viewMap}
            </Button>
          </div>
        </div>
      </section>

      {/* Sightseeing Section */}
      <section id="sightseeing" className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t.sightseeing.title}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          {sightseeing.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Coming soon...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {sightseeing.map((place) => (
                <Card key={place.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <div className="relative aspect-video">
                    <img 
                      src={place.image_url} 
                      alt={place.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">{place.name}</h3>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-slate-600">{place.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact & QR Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t.contact.title}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Buttons */}
            <div className="space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-6 text-lg"
                onClick={() => window.open(settings?.instagram_url || 'https://www.instagram.com/skapeta_apartments', '_blank')}
              >
                <Instagram className="w-5 h-5 mr-2" />
                {t.contact.instagram}
              </Button>

              <Button 
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-6 text-lg"
                onClick={() => window.open(settings?.booking_url || 'https://www.booking.com/hotel/al/pirro-39-s-vacation-home.html', '_blank')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t.contact.booking}
              </Button>

              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg"
                onClick={() => window.open(`https://wa.me/${settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '355693227207'}`, '_blank')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t.contact.whatsapp}
              </Button>

              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6 text-lg"
                onClick={() => window.open(settings?.google_maps_url || 'https://maps.google.com/?q=Saranda,Albania', '_blank')}
              >
                <MapPin className="w-5 h-5 mr-2" />
                {t.contact.maps}
              </Button>
              
              {/* Sponsored Link - Red Button */}
              {settings?.sponsored_by_text && settings?.sponsored_by_url && (
                <Button
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-6 text-lg"
                  onClick={() => window.open(settings.sponsored_by_url, '_blank')}
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  {settings.sponsored_by_text}
                </Button>
              )}

              {/* Custom Contact Links */}
              {settings?.custom_contact_links && settings.custom_contact_links.length > 0 && (
                settings.custom_contact_links.map((link, index) => (
                  <Button
                    key={index}
                    className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white py-6 text-lg"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    {link.name}
                  </Button>
                ))
              )}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.qrcode.title}</h3>
              {qrCodeUrl && (
                <>
                  <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <Button 
                    variant="outline"
                    onClick={downloadQRCode}
                    className="border-2 border-sky-500 text-sky-600 hover:bg-sky-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t.qrcode.download}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {settings?.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-sky-500" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                )}
                <span className="font-semibold text-xl">Skapeta Apartments</span>
              </div>
              <p className="text-slate-400">{t.hero.subtitle.split('\n')[0]}</p>
              {settings?.star_rating > 0 && (
                <div className="flex gap-1 mt-2">
                  {[...Array(settings.star_rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">{t.contact.title}</h4>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{settings?.address || t.footer.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{settings?.phone || t.footer.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('apartments')} className="block text-slate-400 hover:text-white transition-colors">{t.nav.apartments}</button>
                <button onClick={() => scrollToSection('food')} className="block text-slate-400 hover:text-white transition-colors">{t.nav.food}</button>
                <button onClick={() => scrollToSection('location')} className="block text-slate-400 hover:text-white transition-colors">{t.nav.location}</button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            {settings?.footer_custom_text && (
              <p className="text-slate-400 text-sm text-center mb-4">{settings.footer_custom_text}</p>
            )}
            <p className="text-center text-slate-400">© {new Date().getFullYear()} Skapeta Apartments. {t.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
