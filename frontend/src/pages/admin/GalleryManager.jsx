import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { galleryAPI, uploadAPI } from '../../services/api';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const data = await galleryAPI.getAll();
      setImages(data);
    } catch (error) {
      console.error('Failed to load gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const result = await uploadAPI.uploadImage(file);
        const fileUrl = `${BACKEND_URL}${result.url}`;
        
        await galleryAPI.add({
          url: fileUrl,
          category: 'general',
          media_type: result.media_type || 'image',
        });
      }
      
      toast.success(`${files.length} file(s) uploaded`);
      loadGallery();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await galleryAPI.delete(image.id);
      toast.success('Image deleted');
      loadGallery();
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading gallery...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Gallery</h2>
            <p className="text-slate-600">Manage your gallery images</p>
          </div>
        </div>

        {/* Upload Area */}
        <Card>
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="gallery-upload"
                disabled={uploading}
              />
              <label
                htmlFor="gallery-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {uploading ? 'Uploading...' : 'Upload Images & Videos'}
                </h3>
                <p className="text-slate-600">
                  Click to select images and videos to upload to gallery
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Supported: JPG, PNG, GIF, MP4, WEBM, MOV
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">No images or videos in gallery yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((item) => (
              <div key={item.id} className="relative group">
                {item.media_type === 'video' ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md bg-slate-900">
                    <video
                      src={item.url}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      controls
                    />
                    <Badge className="absolute top-2 left-2 bg-purple-500 z-10">Video</Badge>
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg overflow-hidden shadow-md bg-slate-900">
                    <img
                      src={item.url}
                      alt={item.caption || 'Gallery item'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center text-sm text-slate-500">
          Total: {images.length} item(s) ({images.filter(i => i.media_type === 'video').length} videos, {images.filter(i => i.media_type !== 'video').length} images)
        </div>
      </div>
    </AdminLayout>
  );
};
