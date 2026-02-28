import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';
import { menuAPI, uploadAPI } from '../../services/api';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const MenuManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    image: '',
    available: true,
  });

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const items = await menuAPI.getAll();
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu:', error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAPI.uploadImage(file);
      const fileUrl = `${BACKEND_URL}${result.url}`;
      setFormData({ ...formData, image: fileUrl });
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill in name and price');
      return;
    }

    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingItem) {
        await menuAPI.update(editingItem.id, itemData);
        toast.success('Menu item updated');
      } else {
        await menuAPI.create(itemData);
        toast.success('Menu item added');
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        image: '',
        available: true,
      });
      loadMenu();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      available: item.available,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await menuAPI.delete(id);
      toast.success('Menu item deleted');
      loadMenu();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await menuAPI.update(item.id, { available: !item.available });
      toast.success(`Item ${!item.available ? 'enabled' : 'disabled'}`);
      loadMenu();
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const categories = ['Main Course', 'Appetizer', 'Dessert', 'Beverage', 'Breakfast', 'Salad', 'Soup', 'Side Dish'];

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading menu...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Menu Management</h2>
            <p className="text-slate-600">Manage your food service menu</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingItem(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                category: 'Main Course',
                image: '',
                available: true,
              });
            }}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <Card className="border-2 border-sky-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-sky-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-sky-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-sky-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-sky-500 outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Image
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                    {formData.image && (
                      <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 text-sky-500"
                  />
                  <label htmlFor="available" className="text-sm font-medium text-slate-700">
                    Available for ordering
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Grid */}
        {menuItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">No menu items yet. Add your first item!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <Card key={item.id} className={`overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
                <div className="relative aspect-video">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <Badge className={`absolute top-2 right-2 ${item.available ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                  <Badge className="absolute top-2 left-2 bg-sky-500 text-white">
                    {item.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-2xl font-bold text-sky-600 mb-4">€{item.price.toFixed(2)}</p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAvailability(item)}
                      className="flex-1"
                    >
                      {item.available ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
