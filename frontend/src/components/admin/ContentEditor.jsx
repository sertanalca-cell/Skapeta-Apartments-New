import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { settingsAPI } from '../../services/api';
import { toast } from 'sonner';
import { Save, MapPin, Plus, Trash2, GripVertical } from 'lucide-react';

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

      {/* Quick Navigation Menu Manager */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Navigation Menu</h3>
              <Button
                onClick={() => {
                  const newItem = {
                    id: `nav-${Date.now()}`,
                    label: 'New Button',
                    icon: 'Building2',
                    color: 'from-blue-500 to-blue-700',
                    action_type: 'scroll',
                    action_value: 'home',
                    order: (settings?.quick_nav_items || []).length
                  };
                  setSettings({
                    ...settings,
                    quick_nav_items: [...(settings?.quick_nav_items || []), newItem]
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Button
              </Button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Manage the quick navigation buttons that appear at the top of the landing page. These buttons allow horizontal scrolling if there are many items.
            </p>

            {/* Quick Nav Items List */}
            <div className="space-y-3">
              {(settings?.quick_nav_items || []).sort((a, b) => a.order - b.order).map((item, index) => (
                <div key={item.id} className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-slate-400 mt-2 cursor-move" />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Label */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Label</label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const updatedItems = [...(settings?.quick_nav_items || [])];
                            updatedItems[index] = { ...item, label: e.target.value };
                            setSettings({ ...settings, quick_nav_items: updatedItems });
                          }}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                          placeholder="Button text"
                        />
                      </div>

                      {/* Icon */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Icon</label>
                        <select
                          value={item.icon}
                          onChange={(e) => {
                            const updatedItems = [...(settings?.quick_nav_items || [])];
                            updatedItems[index] = { ...item, icon: e.target.value };
                            setSettings({ ...settings, quick_nav_items: updatedItems });
                          }}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        >
                          <option value="Building2">Building2 (Apartments)</option>
                          <option value="UtensilsCrossed">UtensilsCrossed (Menu)</option>
                          <option value="MapIcon">MapIcon (Things to Do)</option>
                          <option value="CloudSun">CloudSun (Weather)</option>
                        </select>
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color</label>
                        <select
                          value={item.color}
                          onChange={(e) => {
                            const updatedItems = [...(settings?.quick_nav_items || [])];
                            updatedItems[index] = { ...item, color: e.target.value };
                            setSettings({ ...settings, quick_nav_items: updatedItems });
                          }}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        >
                          <option value="from-blue-500 to-blue-700">Blue</option>
                          <option value="from-orange-500 to-red-600">Orange-Red</option>
                          <option value="from-purple-500 to-purple-700">Purple</option>
                          <option value="from-green-500 to-emerald-600">Green</option>
                          <option value="from-pink-500 to-pink-700">Pink</option>
                          <option value="from-yellow-500 to-yellow-700">Yellow</option>
                        </select>
                      </div>

                      {/* Action Type */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Action Type</label>
                        <select
                          value={item.action_type}
                          onChange={(e) => {
                            const updatedItems = [...(settings?.quick_nav_items || [])];
                            updatedItems[index] = { ...item, action_type: e.target.value };
                            setSettings({ ...settings, quick_nav_items: updatedItems });
                          }}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        >
                          <option value="scroll">Scroll to Section</option>
                          <option value="navigate">Navigate to Page</option>
                          <option value="external">Open External Link</option>
                        </select>
                      </div>

                      {/* Action Value */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          {item.action_type === 'scroll' ? 'Section ID' : item.action_type === 'navigate' ? 'Route' : 'URL'}
                        </label>
                        <input
                          type="text"
                          value={item.action_value}
                          onChange={(e) => {
                            const updatedItems = [...(settings?.quick_nav_items || [])];
                            updatedItems[index] = { ...item, action_value: e.target.value };
                            setSettings({ ...settings, quick_nav_items: updatedItems });
                          }}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                          placeholder={
                            item.action_type === 'scroll' ? 'e.g., apartments' :
                            item.action_type === 'navigate' ? 'e.g., /food-service' :
                            'e.g., https://google.com'
                          }
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      onClick={() => {
                        const updatedItems = (settings?.quick_nav_items || []).filter((_, i) => i !== index);
                        setSettings({ ...settings, quick_nav_items: updatedItems });
                      }}
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {(!settings?.quick_nav_items || settings.quick_nav_items.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  No quick navigation buttons yet. Click "Add Button" to create one.
                </div>
              )}
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