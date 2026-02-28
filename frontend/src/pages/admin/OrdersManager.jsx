import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Clock, CheckCircle2, Truck, Package, X, User, Home } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { toast } from 'sonner';

export const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize notification sound
  const notificationSound = React.useRef(null);

  useEffect(() => {
    // Create audio element for notification
    notificationSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE'); 
  }, []);

  useEffect(() => {
    loadOrders();
    // Poll for new orders every 5 seconds
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      const filter = statusFilter === 'all' ? null : statusFilter;
      const data = await ordersAPI.getAll(filter);
      
      // Check for new orders and play sound
      if (audioInitialized && data.length > lastOrderCount) {
        const newOrders = data.filter(order => 
          order.status === 'pending' && 
          !orders.some(existing => existing.id === order.id)
        );
        
        if (newOrders.length > 0 && notificationSound.current) {
          notificationSound.current.play().catch(err => console.log('Sound play failed:', err));
          
          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${newOrders.length} New Order${newOrders.length > 1 ? 's' : ''}!`, {
              body: `Order #${newOrders[0].order_number} from ${newOrders[0].first_name} ${newOrders[0].last_name}`,
              icon: '/logo192.png',
              tag: 'new-order'
            });
          }
        }
      }
      
      setOrders(data);
      if (audioInitialized) {
        setLastOrderCount(data.length);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setAudioInitialized(true);
  }, []);

  const updateOrderStatus = async (orderId, status, estimatedTime = null) => {
    try {
      const updateData = { status };
      if (estimatedTime) {
        updateData.estimated_time = estimatedTime;
      }
      await ordersAPI.updateStatus(orderId, updateData);
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order status');
    }
  };

  const acceptOrder = async (orderId, estimatedTime) => {
    await updateOrderStatus(orderId, 'accepted', estimatedTime);
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await ordersAPI.delete(orderId);
      toast.success('Order deleted');
      loadOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error('Failed to delete order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'on_the_way': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'on_the_way': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'on_the_way', label: 'On the Way' },
    { value: 'delivered', label: 'Delivered' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Orders Management</h2>
          <p className="text-slate-600">Manage food service orders</p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                statusFilter === filter.value
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{orders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-500">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-500">
                {orders.filter(o => ['accepted', 'preparing', 'on_the_way'].includes(o.status)).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-sky-500 to-blue-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                €{orders.reduce((sum, o) => sum + o.total_price, 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusText(order.status)}</span>
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {formatDate(order.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-4 h-4" />
                        <span className="font-semibold">{order.first_name} {order.last_name}</span>
                        {order.phone && (
                          <span className="text-sm text-slate-500">• {order.phone}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <Home className="w-4 h-4" />
                        <span>Apartment: <span className="font-semibold">{order.apartment_number}</span></span>
                      </div>

                      {/* Order Items */}
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="font-semibold text-slate-900 mb-2">Order Items:</p>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-sm text-slate-700">
                              {item.quantity}x {item.menu_item_name} - €{(item.price * item.quantity).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <span className="font-bold text-lg text-sky-600">
                            Total: €{order.total_price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="text-sm text-slate-600 italic">
                          <span className="font-semibold">Notes:</span> {order.notes}
                        </div>
                      )}

                      {order.estimated_time && order.status !== 'delivered' && (
                        <div className="flex items-center gap-2 text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Estimated: {order.estimated_time} minutes</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      {order.status === 'pending' && (
                        <>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Accept & Set Time:</p>
                          <Button
                            size="sm"
                            onClick={() => acceptOrder(order.id, 15)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            15 minutes
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => acceptOrder(order.id, 20)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            20 minutes
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => acceptOrder(order.id, 30)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            30 minutes
                          </Button>
                        </>
                      )}

                      {order.status === 'accepted' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Mark Preparing
                        </Button>
                      )}

                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          On the Way
                        </Button>
                      )}

                      {order.status === 'on_the_way' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Delivered
                        </Button>
                      )}

                      {order.status !== 'delivered' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteOrder(order.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
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
