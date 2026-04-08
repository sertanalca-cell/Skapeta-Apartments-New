import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { settingsAPI } from '../../services/api';
import { toast } from 'sonner';
import { Save, MapPin } from 'lucide-react';

export const ContentEditor = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      toast.success('Content updated successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Content Editor</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Weather Location */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Weather Location</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Location (for weather widget)
              </label>
              <input
                type="text"
                value={settings?.weather_location || ''}
                onChange={(e) => setSettings({ ...settings, weather_location: e.target.value })}
                placeholder="e.g., Tirana, Albania"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <p className="text-sm text-slate-500 mt-1">This location will be used for the weather button</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apartments Content */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Apartments Section</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Manage apartments in the <a href="/admin/apartments" className="text-blue-600 hover:underline">Apartments page</a>
          </p>
        </CardContent>
      </Card>

      {/* Menu Content */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Menu Section</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Manage menu items in the <a href="/admin/menu" className="text-blue-600 hover:underline">Menu page</a>
          </p>
        </CardContent>
      </Card>

      {/* Things to Do Content */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Things to Do Section</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Manage sightseeing places in the <a href="/admin/sightseeing" className="text-blue-600 hover:underline">Sightseeing page</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};