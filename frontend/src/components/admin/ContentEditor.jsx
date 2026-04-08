import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { settingsAPI, uploadAPI } from '../../services/api';
import { toast } from 'sonner';
import { Save, MapPin, Plus, Trash2, GripVertical, Upload, X, Image as ImageIcon } from 'lucide-react';

export const ContentEditor = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState({});
  const [uploadingContent, setUploadingContent] = useState({});

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

  const handleIconUpload = async (e, itemId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploadingIcon(prev => ({ ...prev, [itemId]: true }));
    try {
      const result = await uploadAPI.uploadImage(file);
      const url = result.url || result.image_url;
      
      const updatedItems = (settings?.quick_nav_items || []).map(item =>
        item.id === itemId ? { ...item, icon: url } : item
      );
      
      setSettings({ ...settings, quick_nav_items: updatedItems });
      toast.success('Icon uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload icon:', error);
      toast.error('Failed to upload icon');
    } finally {
      setUploadingIcon(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleContentImageUpload = async (e, itemId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploadingContent(prev => ({ ...prev, [itemId]: true }));
    try {
      const result = await uploadAPI.uploadImage(file);
      const url = result.url || result.image_url;
      
      const updatedItems = (settings?.quick_nav_items || []).map(item => {
        if (item.id === itemId) {
          const customContent = item.custom_content || { title: '', description: '', images: [] };
          return {
            ...item,
            custom_content: {
              ...customContent,
              images: [...(customContent.images || []), url]
            }
          };
        }
        return item;
      });
      
      setSettings({ ...settings, quick_nav_items: updatedItems });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingContent(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeContentImage = (itemId, imageUrl) => {
    const updatedItems = (settings?.quick_nav_items || []).map(item => {
      if (item.id === itemId && item.custom_content) {
        return {
          ...item,
          custom_content: {
            ...item.custom_content,
            images: (item.custom_content.images || []).filter(img => img !== imageUrl)
          }
        };
      }
      return item;
    });
    
    setSettings({ ...settings, quick_nav_items: updatedItems });
  };

  const updateItem = (itemId, updates) => {
    const updatedItems = (settings?.quick_nav_items || []).map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    setSettings({ ...settings, quick_nav_items: updatedItems });
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
                    order: (settings?.quick_nav_items || []).length,
                    custom_content: null
                  };
                  setSettings({
                    ...settings,
                    quick_nav_items: [...(settings?.quick_nav_items || []), newItem]
                  });
                  toast.success('New button added! Scroll down to edit.');
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Button
              </Button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              📱 Buttons will scroll horizontally on the website. Add as many as you want!
            </p>

            {/* Quick Nav Items List */}
            <div className="space-y-4">
              {(settings?.quick_nav_items || []).sort((a, b) => a.order - b.order).map((item) => (
                <div key={item.id} className="border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-slate-400 mt-2 cursor-move flex-shrink-0" />
                    
                    <div className="flex-1 space-y-4">
                      {/* Row 1: Label & Icon Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Button Label (Name)
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateItem(item.id, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                            placeholder="e.g., Spa Services"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Icon Type
                          </label>
                          <select
                            value={item.icon.startsWith('http') ? 'custom' : item.icon}
                            onChange={(e) => {
                              if (e.target.value !== 'custom') {
                                updateItem(item.id, { icon: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                          >
                            <option value="Building2">🏠 Apartments</option>
                            <option value="UtensilsCrossed">🍴 Menu</option>
                            <option value="MapIcon">🗺️ Things to Do</option>
                            <option value="CloudSun">☁️ Weather</option>
                            <option value="custom">🎨 Custom Icon (Upload)</option>
                          </select>
                        </div>
                      </div>

                      {/* Custom Icon Upload */}
                      {(item.icon === 'custom' || item.icon.startsWith('http')) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Custom Icon Image
                          </label>
                          {item.icon.startsWith('http') ? (
                            <div className="flex items-center gap-2">
                              <img src={item.icon} alt="icon" className="w-12 h-12 rounded object-cover border-2 border-blue-500" />
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateItem(item.id, { icon: 'Building2' })}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleIconUpload(e, item.id)}
                                className="hidden"
                                id={`icon-upload-${item.id}`}
                              />
                              <Button
                                size="sm"
                                onClick={() => document.getElementById(`icon-upload-${item.id}`).click()}
                                disabled={uploadingIcon[item.id]}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {uploadingIcon[item.id] ? 'Uploading...' : 'Upload Icon'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Row 2: Color & Action Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Button Color
                          </label>
                          <select
                            value={item.color}
                            onChange={(e) => updateItem(item.id, { color: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                          >
                            <option value="from-blue-500 to-blue-700">🔵 Blue</option>
                            <option value="from-orange-500 to-red-600">🟠 Orange-Red</option>
                            <option value="from-purple-500 to-purple-700">🟣 Purple</option>
                            <option value="from-green-500 to-emerald-600">🟢 Green</option>
                            <option value="from-pink-500 to-pink-700">🌸 Pink</option>
                            <option value="from-yellow-500 to-yellow-700">🟡 Yellow</option>
                            <option value="from-indigo-500 to-indigo-700">💙 Indigo</option>
                            <option value="from-red-500 to-red-700">🔴 Red</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Action Type
                          </label>
                          <select
                            value={item.action_type}
                            onChange={(e) => updateItem(item.id, { action_type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                          >
                            <option value="scroll">📍 Scroll to Section</option>
                            <option value="navigate">🔗 Navigate to Page</option>
                            <option value="external">🌐 Open External Link</option>
                            <option value="modal">💬 Show Custom Content (Modal)</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Value */}
                      {item.action_type !== 'modal' && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {item.action_type === 'scroll' ? 'Section ID' : 
                             item.action_type === 'navigate' ? 'Route Path' : 
                             'External URL'}
                          </label>
                          <input
                            type="text"
                            value={item.action_value}
                            onChange={(e) => updateItem(item.id, { action_value: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                            placeholder={
                              item.action_type === 'scroll' ? 'e.g., apartments, sightseeing' :
                              item.action_type === 'navigate' ? 'e.g., /food-service' :
                              'e.g., https://example.com'
                            }
                          />
                        </div>
                      )}

                      {/* Custom Modal Content */}
                      {item.action_type === 'modal' && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg space-y-3 border-2 border-purple-300 dark:border-purple-700">
                          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Custom Content (Modal)
                          </h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Modal Title
                            </label>
                            <input
                              type="text"
                              value={item.custom_content?.title || ''}
                              onChange={(e) => updateItem(item.id, {
                                custom_content: {
                                  ...(item.custom_content || {}),
                                  title: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                              placeholder="e.g., Spa Services"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Modal Description
                            </label>
                            <textarea
                              value={item.custom_content?.description || ''}
                              onChange={(e) => updateItem(item.id, {
                                custom_content: {
                                  ...(item.custom_content || {}),
                                  description: e.target.value
                                }
                              })}
                              rows={3}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                              placeholder="Describe your service..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Images
                            </label>
                            
                            {/* Image Grid */}
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              {(item.custom_content?.images || []).map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img}
                                    alt={`Content ${idx + 1}`}
                                    className="w-full h-24 object-cover rounded border-2 border-slate-300"
                                  />
                                  <button
                                    onClick={() => removeContentImage(item.id, img)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Upload Button */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleContentImageUpload(e, item.id)}
                              className="hidden"
                              id={`content-upload-${item.id}`}
                            />
                            <Button
                              size="sm"
                              onClick={() => document.getElementById(`content-upload-${item.id}`).click()}
                              disabled={uploadingContent[item.id]}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingContent[item.id] ? 'Uploading...' : 'Add Image'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <Button
                      onClick={() => {
                        const updatedItems = (settings?.quick_nav_items || []).filter(i => i.id !== item.id);
                        setSettings({ ...settings, quick_nav_items: updatedItems });
                        toast.success('Button removed');
                      }}
                      variant="destructive"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {(!settings?.quick_nav_items || settings.quick_nav_items.length === 0) && (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                  <p className="text-lg">No quick navigation buttons yet.</p>
                  <p className="text-sm">Click "Add Button" above to create one.</p>
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
