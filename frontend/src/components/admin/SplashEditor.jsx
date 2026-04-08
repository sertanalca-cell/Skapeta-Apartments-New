import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { settingsAPI } from '../../services/api';
import { toast } from 'sonner';
import { Save, Play, Palette } from 'lucide-react';

export const SplashEditor = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [customColor, setCustomColor] = useState('');

  const animations = [
    { value: 'fade', label: 'Fade In/Out', description: 'Simple opacity transition' },
    { value: 'slide', label: 'Slide Up', description: 'Slides from bottom' },
    { value: 'zoom', label: 'Zoom In', description: 'Scales from center' },
    { value: 'rotate', label: 'Rotate & Zoom', description: 'Spins and scales' },
    { value: 'bounce', label: 'Bounce', description: 'Bounces from top' }
  ];

  const colorPresets = [
    { primary: '#0ea5e9', secondary: '#3b82f6', name: 'Sky Blue' },
    { primary: '#8b5cf6', secondary: '#a855f7', name: 'Purple' },
    { primary: '#f59e0b', secondary: '#f97316', name: 'Orange' },
    { primary: '#10b981', secondary: '#059669', name: 'Green' },
    { primary: '#ef4444', secondary: '#dc2626', name: 'Red' },
    { primary: '#ec4899', secondary: '#db2777', name: 'Pink' },
    { primary: '#14b8a6', secondary: '#0d9488', name: 'Teal' },
    { primary: '#6366f1', secondary: '#4f46e5', name: 'Indigo' }
  ];

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Splash screen settings saved!');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addCustomColor = () => {
    if (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) {
      setSettings({
        ...settings,
        splash_primary_color: customColor,
        splash_secondary_color: customColor
      });
      setCustomColor('');
      toast.success('Custom color applied!');
    } else {
      toast.error('Invalid hex color. Use format: #FF5733');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Splash Screen Editor</h2>
        <div className="flex gap-2">
          <Button onClick={() => setPreview(true)} variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Animation Type */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Animation Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {animations.map((anim) => (
              <button
                key={anim.value}
                onClick={() => setSettings({ ...settings, splash_animation: anim.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  settings?.splash_animation === anim.value
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white">{anim.label}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{anim.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Presets */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Color Presets</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {colorPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSettings({
                  ...settings,
                  splash_primary_color: preset.primary,
                  splash_secondary_color: preset.secondary
                })}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  settings?.splash_primary_color === preset.primary
                    ? 'border-slate-900 dark:border-white scale-105'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`
                }}
              >
                <div className="text-white font-semibold text-center">{preset.name}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Color */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Custom Color</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value.toUpperCase())}
              placeholder="#FF5733"
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
            <Button onClick={addCustomColor} className="bg-purple-600 hover:bg-purple-700">
              Apply
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-2">Enter a hex color code (e.g., #FF5733)</p>
        </CardContent>
      </Card>

      {/* Duration */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Display Duration</h3>
          <input
            type="range"
            min="1000"
            max="5000"
            step="100"
            value={settings?.splash_duration || 2000}
            onChange={(e) => setSettings({ ...settings, splash_duration: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mt-2">
            <span>1s</span>
            <span className="font-semibold">{((settings?.splash_duration || 2000) / 1000).toFixed(1)}s</span>
            <span>5s</span>
          </div>
        </CardContent>
      </Card>

      {/* Subtitle */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Subtitle</h3>
          <input
            type="text"
            value={settings?.splash_subtitle || ''}
            onChange={(e) => setSettings({ ...settings, splash_subtitle: e.target.value })}
            placeholder="e.g., Saranda, Albania"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${settings?.splash_primary_color || '#0ea5e9'}, ${settings?.splash_secondary_color || '#3b82f6'})`
            }}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-fadeIn">
                <div className="mb-6 flex justify-center">
                  {settings?.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl animate-pulse" />
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                      <span className="text-6xl font-bold" style={{ color: settings?.splash_primary_color }}>S</span>
                    </div>
                  )}
                </div>
                <h1 className="text-5xl font-bold text-white mb-2">{settings?.hero_title || 'Skapeta Apartments'}</h1>
                <p className="text-xl text-white/90">{settings?.splash_subtitle || 'Saranda, Albania'}</p>
              </div>
            </div>
            <Button
              onClick={() => setPreview(false)}
              className="absolute top-4 right-4 bg-white text-slate-900"
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
