import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { apartmentsAPI, uploadAPI } from '../../services/api';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const ApartmentsManager = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    price_unit: 'per night',
    capacity: '',
    available: true,
    images: [],
  });

  useEffect(() => {
    loadApartments();
  }, []);

  const loadApartments = async () => {
    try {
      const data = await apartmentsAPI.getAll();
      setApartments(data);
    } catch (error) {
      console.error('Failed to load apartments:', error);
      toast.error('Failed to load apartments');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => uploadAPI.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      const imageUrls = results.map(result => `${BACKEND_URL}${result.url}`);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));
      
      toast.success(`${files.length} image(s) uploaded`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const openCreateDialog = () => {
    setEditingApartment(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      price_unit: 'per night',
      capacity: '',
      available: true,
      images: [],
    });
    setShowDialog(true);
  };

  const openEditDialog = (apartment) => {
    setEditingApartment(apartment);
    setFormData({
      name: apartment.name,
      description: apartment.description,
      price: apartment.price.toString(),
      price_unit: apartment.price_unit,
      capacity: apartment.capacity,
      available: apartment.available,
      images: apartment.images,
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const apartmentData = {
      ...formData,
      price: parseFloat(formData.price),
    };

    try {
      if (editingApartment) {
        await apartmentsAPI.update(editingApartment.id, apartmentData);
        toast.success('Apartment updated successfully');
      } else {
        await apartmentsAPI.create(apartmentData);
        toast.success('Apartment created successfully');
      }
      
      setShowDialog(false);
      loadApartments();
    } catch (error) {
      console.error('Failed to save apartment:', error);
      toast.error('Failed to save apartment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this apartment?')) return;

    try {
      await apartmentsAPI.delete(id);
      toast.success('Apartment deleted');
      loadApartments();
    } catch (error) {
      console.error('Failed to delete apartment:', error);
      toast.error('Failed to delete apartment');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading apartments...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Apartments</h2>
            <p className="text-slate-600">Manage your apartment listings</p>
          </div>
          <Button onClick={openCreateDialog} className="bg-gradient-to-r from-sky-500 to-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Apartment
          </Button>
        </div>

        {apartments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">No apartments yet</p>
              <Button onClick={openCreateDialog}>Create your first apartment</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {apartments.map((apartment) => (
              <Card key={apartment.id}>
                <div className="relative aspect-video">
                  {apartment.images.length > 0 ? (
                    <img
                      src={apartment.images[0]}
                      alt={apartment.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center rounded-t-lg">
                      <span className="text-slate-400">No image</span>
                    </div>
                  )}
                  {apartment.available && (
                    <Badge className="absolute top-4 right-4 bg-green-500">Available</Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{apartment.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(apartment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(apartment.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{apartment.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-sky-600">€{apartment.price}</span>
                      <span className="text-slate-500 text-sm ml-1">{apartment.price_unit}</span>
                    </div>
                    <span className="text-slate-600">{apartment.capacity}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    {apartment.images.length} photo(s)
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Apartment Name *</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    placeholder="e.g., 2-4 guests"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="available">Available for booking</Label>
              </div>

              <div>
                <Label>Images</Label>
                <div className="mt-2 space-y-3">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImages}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-600">
                        {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                      </span>
                    </label>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full aspect-video object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingApartment ? 'Update' : 'Create'} Apartment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
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
