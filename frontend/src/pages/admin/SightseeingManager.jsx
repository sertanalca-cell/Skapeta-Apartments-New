import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { sightseeingAPI, uploadAPI } from '../../services/api';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const SightseeingManager = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    order: 0,
  });

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const data = await sightseeingAPI.getAll();
      setPlaces(data);
    } catch (error) {
      console.error('Failed to load places:', error);
      toast.error('Failed to load sightseeing places');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadAPI.uploadImage(file);
      const imageUrl = `${BACKEND_URL}${result.url}`;
      
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlace(null);
    setFormData({ name: '', description: '', image_url: '', order: 0 });
    setShowDialog(true);
  };

  const openEditDialog = (place) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      description: place.description,
      image_url: place.image_url,
      order: place.order,
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPlace) {
        await sightseeingAPI.update(editingPlace.id, formData);
        toast.success('Place updated successfully');
      } else {
        await sightseeingAPI.create(formData);
        toast.success('Place created successfully');
      }
      
      setShowDialog(false);
      loadPlaces();
    } catch (error) {
      console.error('Failed to save place:', error);
      toast.error('Failed to save place');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this place?')) return;

    try {
      await sightseeingAPI.delete(id);
      toast.success('Place deleted');
      loadPlaces();
    } catch (error) {
      console.error('Failed to delete place:', error);
      toast.error('Failed to delete place');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Things to Do in Saranda</h2>
            <p className="text-slate-600">Manage sightseeing attractions</p>
          </div>
          <Button onClick={openCreateDialog} className="bg-gradient-to-r from-sky-500 to-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Place
          </Button>
        </div>

        {places.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">No places yet</p>
              <Button onClick={openCreateDialog}>Add your first place</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {places.map((place) => (
              <Card key={place.id}>
                <div className="relative aspect-video">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{place.name}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(place)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(place.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-slate-600 text-sm line-clamp-3">{place.description}</p>
                  <div className="mt-2 text-sm text-slate-500">Order: {place.order}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlace ? 'Edit Place' : 'Add New Place'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Place Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Image *</Label>
                <div className="mt-2 space-y-3">
                  {formData.image_url && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-600">
                        {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={!formData.image_url}>
                  {editingPlace ? 'Update' : 'Create'} Place
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
