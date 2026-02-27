import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Building2, Image, Settings as SettingsIcon, TrendingUp, Utensils, MapIcon, Edit } from 'lucide-react';
import { apartmentsAPI, galleryAPI, settingsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    apartments: 0,
    galleryImages: 0,
    foodImages: 0,
    loading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [apartments, gallery] = await Promise.all([
        apartmentsAPI.getAll(),
        galleryAPI.getAll(),
      ]);

      setStats({
        apartments: apartments.length,
        galleryImages: gallery.length,
        foodImages: gallery.filter(img => img.category === 'food').length,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: 'Apartments',
      value: stats.apartments,
      icon: Building2,
      color: 'from-sky-400 to-blue-600',
      path: '/admin/apartments',
    },
    {
      title: 'Gallery Images',
      value: stats.galleryImages,
      icon: Image,
      color: 'from-purple-400 to-pink-600',
      path: '/admin/gallery',
    },
    {
      title: 'Food Service',
      value: stats.foodImages,
      icon: Utensils,
      color: 'from-orange-400 to-red-600',
      path: '/admin/gallery',
    },
    {
      title: 'Settings',
      value: 'Manage',
      icon: SettingsIcon,
      color: 'from-green-400 to-emerald-600',
      path: '/admin/settings',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
          <p className="text-slate-600">Welcome to Skapeta Apartments admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(stat.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.loading ? '...' : stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin/apartments')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left"
              >
                <Building2 className="w-8 h-8 text-sky-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Add New Apartment</h3>
                <p className="text-sm text-slate-600">Create a new apartment listing</p>
              </button>

              <button
                onClick={() => navigate('/admin/gallery')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
              >
                <Image className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Upload Images</h3>
                <p className="text-sm text-slate-600">Add photos to gallery</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Manage Your Property</h3>
                <p className="text-slate-600">
                  Use this admin panel to manage apartments, upload images, and update website settings. 
                  All changes are saved to the database and reflected on the main website immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
