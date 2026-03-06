import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Building2, Image, Settings as SettingsIcon, TrendingUp, Utensils, MapIcon, Edit, ShoppingCart, UtensilsCrossed, DollarSign, Package, Users } from 'lucide-react';
import { apartmentsAPI, galleryAPI, settingsAPI, ordersAPI, menuAPI, analyticsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    apartments: 0,
    galleryImages: 0,
    foodImages: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    menuItems: 0,
    totalVisits: 0,
    todayVisits: 0,
    loading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [apartments, gallery, orders, menuItems, analyticsData] = await Promise.all([
        apartmentsAPI.getAll(),
        galleryAPI.getAll(),
        ordersAPI.getAll(),
        menuAPI.getAll(),
        analyticsAPI.getStats(),
      ]);

      // Calculate today's revenue
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => 
        new Date(order.created_at).toDateString() === today
      );
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_price, 0);

      setStats({
        apartments: apartments.length,
        galleryImages: gallery.length,
        foodImages: gallery.filter(img => img.category === 'food').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total_price, 0),
        todayRevenue: todayRevenue,
        menuItems: menuItems.length,
        totalVisits: analyticsData.total_visits || 0,
        todayVisits: analyticsData.today_visits || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `€${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      path: '/admin/orders',
    },
    {
      title: "Today's Revenue",
      value: `€${stats.todayRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-sky-500 to-blue-600',
      path: '/admin/orders',
    },
    {
      title: 'Website Visitors',
      value: stats.totalVisits,
      subtitle: `${stats.todayVisits} today`,
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      path: '/admin',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-600',
      path: '/admin/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Package,
      color: 'from-orange-500 to-red-600',
      path: '/admin/orders',
    },
    {
      title: 'Apartments',
      value: stats.apartments,
      icon: Building2,
      color: 'from-sky-400 to-blue-600',
      path: '/admin/apartments',
    },
    {
      title: 'Menu Items',
      value: stats.menuItems,
      icon: UtensilsCrossed,
      color: 'from-yellow-400 to-orange-600',
      path: '/admin/menu',
    },
    {
      title: 'Gallery Images',
      value: stats.galleryImages,
      icon: Image,
      color: 'from-purple-400 to-pink-600',
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
                  {stat.subtitle && (
                    <p className="text-sm text-slate-500 mt-1">{stat.subtitle}</p>
                  )}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/admin/apartments')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left"
              >
                <Building2 className="w-8 h-8 text-sky-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Manage Apartments</h3>
                <p className="text-sm text-slate-600">Add, edit or remove apartments</p>
              </button>

              <button
                onClick={() => navigate('/admin/gallery')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
              >
                <Image className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Manage Gallery</h3>
                <p className="text-sm text-slate-600">Upload and organize photos & videos</p>
              </button>

              <button
                onClick={() => navigate('/admin/gallery')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
              >
                <Utensils className="w-8 h-8 text-orange-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Food Service Gallery</h3>
                <p className="text-sm text-slate-600">Manage menu and food images</p>
              </button>

              <button
                onClick={() => navigate('/admin/sightseeing')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
              >
                <MapIcon className="w-8 h-8 text-teal-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Manage Sightseeing</h3>
                <p className="text-sm text-slate-600">Add tourist attractions & spots</p>
              </button>

              <button
                onClick={() => navigate('/admin/orders')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left"
              >
                <ShoppingCart className="w-8 h-8 text-red-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Food Orders</h3>
                <p className="text-sm text-slate-600">Manage customer food orders</p>
              </button>

              <button
                onClick={() => navigate('/admin/menu')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left"
              >
                <UtensilsCrossed className="w-8 h-8 text-yellow-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Menu Management</h3>
                <p className="text-sm text-slate-600">Edit food menu items</p>
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
              >
                <SettingsIcon className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Website Settings</h3>
                <p className="text-sm text-slate-600">Edit site content and links</p>
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-left"
              >
                <Edit className="w-8 h-8 text-amber-600 mb-2" />
                <h3 className="font-semibold text-slate-900">Quick Edit</h3>
                <p className="text-sm text-slate-600">Update hero, about & contact info</p>
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
