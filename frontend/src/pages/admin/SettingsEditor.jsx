import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { settingsAPI, uploadAPI } from '../../services/api';
import { Upload, Save, Star } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const SettingsEditor = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, hero: false, about: false });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsAPI.get();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const result = await uploadAPI.uploadImage(file);
      const fileUrl = `${BACKEND_URL}${result.url}`;
      
      if (type === 'logo') {
        setSettings(prev => ({ ...prev, logo_url: fileUrl }));
      } else if (type === 'hero') {
        setSettings(prev => ({ 
          ...prev, 
          hero_background_url: fileUrl,
          hero_background_type: result.media_type || 'image'
        }));
      } else if (type === 'about') {
        setSettings(prev => ({ ...prev, about_image_url: fileUrl }));
      }
      
      toast.success(`${type} uploaded`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsAPI.update({
        logo_url: settings.logo_url,
        instagram_url: settings.instagram_url,
        booking_url: settings.booking_url,
        whatsapp_number: settings.whatsapp_number,
        google_maps_url: settings.google_maps_url,
        phone: settings.phone,
        address: settings.address,
        sponsored_by_text: settings.sponsored_by_text,
        sponsored_by_url: settings.sponsored_by_url,
        footer_custom_text: settings.footer_custom_text,
        hero_background_url: settings.hero_background_url,
        hero_background_type: settings.hero_background_type,
        about_image_url: settings.about_image_url,
        star_rating: settings.star_rating,
      });
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-600">Manage website settings and branding</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo & Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Logo (Circular)</Label>
                <p className="text-sm text-slate-500 mb-2">Upload a square image for best results</p>
                {settings.logo_url && (
                  <div className="w-32 h-32 border-2 border-slate-200 rounded-full overflow-hidden mt-2 bg-white p-2">
                    <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="hidden"
                  id="logo-upload"
                  disabled={uploading.logo}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => document.getElementById('logo-upload').click()}
                  disabled={uploading.logo}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading.logo ? 'Uploading...' : 'Upload Logo'}
                </Button>
              </div>

              <div>
                <Label htmlFor="star_rating">Star Rating</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="star_rating"
                    type="number"
                    min="1"
                    max="5"
                    value={settings.star_rating}
                    onChange={(e) => setSettings({ ...settings, star_rating: parseInt(e.target.value) })}
                    className="w-24"
                  />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < settings.star_rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hero Background */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Section (Home)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Background Image/Video</Label>
                <p className="text-sm text-slate-500 mb-2">Upload an image or video for the hero section background</p>
                {settings.hero_background_url && (
                  <div className="w-full aspect-video border-2 border-slate-200 rounded-lg overflow-hidden mt-2">
                    {settings.hero_background_type === 'video' ? (
                      <video src={settings.hero_background_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={settings.hero_background_url} alt="Hero Background" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileUpload(e, 'hero')}
                  className="hidden"
                  id="hero-upload"
                  disabled={uploading.hero}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => document.getElementById('hero-upload').click()}
                  disabled={uploading.hero}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading.hero ? 'Uploading...' : 'Upload Hero Background'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>About Section Image</Label>
                <p className="text-sm text-slate-500 mb-2">Upload an image for the About section</p>
                {settings.about_image_url && (
                  <div className="w-full aspect-square max-w-md border-2 border-slate-200 rounded-lg overflow-hidden mt-2">
                    <img src={settings.about_image_url} alt="About" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'about')}
                  className="hidden"
                  id="about-upload"
                  disabled={uploading.about}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => document.getElementById('about-upload').click()}
                  disabled={uploading.about}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading.about ? 'Uploading...' : 'Upload About Image'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Food Service Note */}
          <Card className="bg-sky-50 border-sky-200">
            <CardHeader>
              <CardTitle>Food Service Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-3">
                To add food service photos and menu images:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-600">
                <li>Go to the <strong>Gallery</strong> tab in admin menu</li>
                <li>Upload your food photos and menu images</li>
                <li>Images will automatically appear in the Food Service section on the website</li>
              </ol>
              <p className="text-sm text-slate-500 mt-3">
                Note: All images uploaded to Gallery will show in the Food Service section
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  placeholder="+355693227207"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social & External Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="booking">Booking.com URL</Label>
                <Input
                  id="booking"
                  type="url"
                  value={settings.booking_url}
                  onChange={(e) => setSettings({ ...settings, booking_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="maps">Google Maps URL</Label>
                <Input
                  id="maps"
                  type="url"
                  value={settings.google_maps_url}
                  onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="sponsored_text">Sponsored By Text</Label>
                <Input
                  id="sponsored_text"
                  placeholder="sponsored by @albaniatourism_"
                  value={settings.sponsored_by_text}
                  onChange={(e) => setSettings({ ...settings, sponsored_by_text: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="sponsored_url">Sponsored By URL</Label>
                <Input
                  id="sponsored_url"
                  type="url"
                  placeholder="https://www.instagram.com/albaniatourism_"
                  value={settings.sponsored_by_url}
                  onChange={(e) => setSettings({ ...settings, sponsored_by_url: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card>
            <CardHeader>
              <CardTitle>Footer</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="footer_text">Custom Footer Text</Label>
                <Textarea
                  id="footer_text"
                  rows={3}
                  placeholder="This website was created by..."
                  value={settings.footer_custom_text}
                  onChange={(e) => setSettings({ ...settings, footer_custom_text: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
