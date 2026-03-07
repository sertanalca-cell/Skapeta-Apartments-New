import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Building2, Image, Settings as SettingsIcon, TrendingUp, Utensils, MapIcon, Edit, ShoppingCart, UtensilsCrossed, DollarSign, Package, Users, FileText, Calendar, Clock } from 'lucide-react';
import { reportsAPI, ordersAPI } from '../../services/api';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [lastOrders, setLastOrders] = useState([]);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    fetchCurrentMonthRevenue();
    fetchLastOrders();
  }, []);

  const fetchCurrentMonthRevenue = async () => {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const data = await reportsAPI.getMonthlyRevenue(month);
      setMonthlyRevenue(data);
    } catch (error) {
      console.error('Failed to load revenue:', error);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const fetchLastOrders = async () => {
    try {
      const data = await ordersAPI.getClosedOrders(10);
      setLastOrders(data);
    } catch (error) {
      console.error('Failed to load last orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      on_the_way: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome to Skapeta Apartments Admin</p>
        </div>

        {/* Monthly Revenue Card - TOP */}
        <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-xl">
          <CardContent className="p-6">
            {loadingRevenue ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : monthlyRevenue ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-9 h-9 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                        Monthly Revenue - {getCurrentMonthName()}
                      </h2>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">
                        €{monthlyRevenue.total_revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/admin/revenue-report')}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Full Report
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <UtensilsCrossed className="w-5 h-5 text-sky-600" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Food Orders</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      €{monthlyRevenue.food_orders_total.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {monthlyRevenue.food_orders_count} orders
                    </p>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Manual Reservations</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      €{monthlyRevenue.manual_reservations_total.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {monthlyRevenue.manual_reservations_count} reservations
                    </p>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Booking.com</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      €{monthlyRevenue.booking_reservations_total.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {monthlyRevenue.booking_reservations_count} reservations
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Orders Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-sky-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Last Orders (Closed)</h2>
              </div>
              <Button
                onClick={() => navigate('/admin/orders')}
                variant="outline"
                size="sm"
              >
                View All Orders
              </Button>
            </div>
            
            {loadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
              </div>
            ) : lastOrders.length > 0 ? (
              <div className="space-y-3">
                {lastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Order #{order.order_number || order.id.slice(0, 6)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {order.first_name} {order.last_name} • Room: {order.apartment_number}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Closed: {new Date(order.closed_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        €{order.total_price.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">No closed orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Management Sections */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Content Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/apartments')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left"
            >
              <Building2 className="w-8 h-8 text-sky-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Apartments</h3>
              <p className="text-sm text-slate-600">Manage apartment listings</p>
            </button>

            <button
              onClick={() => navigate('/admin/gallery')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <Image className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Gallery</h3>
              <p className="text-sm text-slate-600">Manage gallery images</p>
            </button>

            <button
              onClick={() => navigate('/admin/menu')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
            >
              <Utensils className="w-8 h-8 text-orange-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Food Menu</h3>
              <p className="text-sm text-slate-600">Manage restaurant menu</p>
            </button>

            <button
              onClick={() => navigate('/admin/orders')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Food Orders</h3>
              <p className="text-sm text-slate-600">View and manage orders</p>
            </button>

            <button
              onClick={() => navigate('/admin/reservations')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <Calendar className="w-8 h-8 text-indigo-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Reservations</h3>
              <p className="text-sm text-slate-600">Manage apartment bookings</p>
            </button>

            <button
              onClick={() => navigate('/admin/expenses')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left"
            >
              <DollarSign className="w-8 h-8 text-red-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Expenses</h3>
              <p className="text-sm text-slate-600">Track business expenses</p>
            </button>

            <button
              onClick={() => navigate('/admin/documents')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
            >
              <FileText className="w-8 h-8 text-teal-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Documents</h3>
              <p className="text-sm text-slate-600">Manage business documents</p>
            </button>

            <button
              onClick={() => navigate('/admin/sightseeing')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all text-left"
            >
              <MapIcon className="w-8 h-8 text-pink-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Sightseeing</h3>
              <p className="text-sm text-slate-600">Manage attractions</p>
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
              onClick={() => navigate('/admin/revenue-report')}
              className="p-4 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg hover:border-amber-500 hover:shadow-lg transition-all text-left"
            >
              <FileText className="w-8 h-8 text-amber-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Monthly Revenue Report</h3>
              <p className="text-sm text-slate-600">View and download financial reports</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
