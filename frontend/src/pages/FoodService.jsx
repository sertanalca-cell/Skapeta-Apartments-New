import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Search, Clock, CheckCircle2, Truck, Package, LogOut, User, Receipt } from 'lucide-react';
import { menuAPI, ordersAPI } from '../services/api';
import { Cart } from '../components/Cart';
import { CustomerLoginModal } from '../components/CustomerLoginModal';
import { OrderHistoryModal } from '../components/OrderHistoryModal';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useOrderWebSocket } from '../hooks/useOrderWebSocket';
import { toast } from 'sonner';

export const FoodService = () => {
  const { customer, logout, loading: authLoading } = useCustomerAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCheckout, setShowCheckout] = useState(false);
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // WebSocket for live order updates
  useOrderWebSocket(customer?.id, (updatedOrder) => {
    setCurrentOrder(updatedOrder);
    setAllOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    toast.success(`Order #${updatedOrder.order_number} status updated: ${updatedOrder.status}`);
  });

  useEffect(() => {
    loadMenu();
    if (customer) {
      fetchCustomerOrders();
    }
  }, [customer]);

  const loadMenu = async () => {
    try {
      const items = await menuAPI.getAll(true);
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu:', error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    if (!customer) return;
    try {
      const orders = await ordersAPI.getByUserId(customer.id);
      setAllOrders(orders);
      setRecentOrders(orders.slice(0, 3));
      
      // Set current active order (pending or accepted)
      const activeOrder = orders.find(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing' || o.status === 'delivering');
      setCurrentOrder(activeOrder || null);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item) => {
    if (!customer) {
      toast.error('Please login to add items to cart');
      setShowLoginModal(true);
      return;
    }
    
    const existingItem = cartItems.find(ci => ci.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(ci => 
        ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    setShowCart(true);
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    toast.info('Item removed from cart');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setShowCheckout(true);
    setShowCart(false);
  };

  const submitOrder = async () => {
    if (!apartmentNumber.trim()) {
      toast.error('Please enter your apartment/room number');
      return;
    }

    try {
      const orderData = {
        user_id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone || null,
        apartment_number: apartmentNumber,
        notes: orderNotes,
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          menu_item_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const newOrder = await ordersAPI.create(orderData);
      
      // Send WhatsApp notification
      sendWhatsAppNotification(newOrder);
      
      toast.success('Order placed successfully!');
      setCartItems([]);
      setShowCheckout(false);
      setOrderNotes('');
      setApartmentNumber('');
      
      // Reload recent orders
      fetchCustomerOrders();
      
      // Show order tracking
      setTimeout(() => setShowOrders(true), 500);
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const sendWhatsAppNotification = (order) => {
    // Format order details for WhatsApp
    const itemsText = order.items.map(item => 
      `  • ${item.quantity}x ${item.menu_item_name} - €${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const message = `🔔 *NEW ORDER RECEIVED*\n\n` +
      `📋 Order #*${order.order_number}*\n` +
      `👤 Customer: *${order.first_name} ${order.last_name}*\n` +
      `📞 Phone: ${order.phone || 'N/A'}\n` +
      `🏠 Apartment: *${order.apartment_number}*\n\n` +
      `🍽️ *Order Items:*\n${itemsText}\n\n` +
      `💰 *Total: €${order.total_price.toFixed(2)}*\n\n` +
      `📝 Notes: ${order.notes || 'None'}`;
    
    // Open WhatsApp with pre-filled message
    const whatsappNumber = '355693227207';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'on_the_way': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login modal if not logged in
  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-2xl text-center py-20">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-xl">
            <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Login Required
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Please login or create an account to access our food service menu and place orders.
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-6 text-lg"
            >
              Login / Register
            </Button>
          </div>
        </div>
        {showLoginModal && (
          <CustomerLoginModal
            onClose={() => setShowLoginModal(false)}
            onSuccess={() => {
              setShowLoginModal(false);
              toast.success('Login successful! You can now browse and order.');
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
              Food Service Menu
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Order delicious meals delivered to your apartment
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowOrderHistory(true)}
              variant="outline"
              className="border-sky-500 text-sky-600 hover:bg-sky-50 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-900"
            >
              <Receipt className="w-4 h-4 mr-2\" />
              Your Orders ({allOrders.length})
            </Button>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Logged in as</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {customer.first_name} {customer.last_name}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Cart Button (Mobile) */}
        <button
          onClick={() => setShowCart(!showCart)}
          className="fixed bottom-6 right-6 md:hidden bg-sky-500 text-white p-4 rounded-full shadow-2xl z-30 hover:bg-sky-600 transition-all"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItems.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
              {cartItems.length}
            </Badge>
          )}
        </button>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-sky-500 outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-sky-200 dark:border-sky-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your Recent Orders
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOrderHistory(true)}
                >
                  View All
                </Button>
              </div>
              {showOrders && (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Order #{order.id.slice(0, 8)}
                        </span>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusText(order.status)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {order.items.length} items • €{order.total_price.toFixed(2)}
                      </p>
                      {order.estimated_time && order.status !== 'delivered' && (
                        <p className="text-sm text-sky-600 dark:text-sky-400 mt-2">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Estimated time: {order.estimated_time} minutes
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Live Order Tracking */}
        {currentOrder && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-green-600" />
                Live Order Status
              </h3>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">Order #{currentOrder.order_number}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(currentOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(currentOrder.status)} text-lg px-4 py-2`}>
                    {getStatusIcon(currentOrder.status)}
                    {getStatusText(currentOrder.status)}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  {currentOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.quantity}x {item.menu_item_name}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-white">Total:</span>
                  <span className="text-2xl font-bold text-green-600">€{currentOrder.total_price.toFixed(2)}</span>
                </div>
                
                {currentOrder.estimated_time && (
                  <div className="mt-4 bg-sky-100 dark:bg-sky-900/30 p-3 rounded-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-sky-600" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Estimated time: {currentOrder.estimated_time} minutes
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No menu items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
                <div className="relative aspect-video">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-sky-500 text-white">
                    {item.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                      €{item.price.toFixed(2)}
                    </span>
                    <Button
                      onClick={() => addToCart(item)}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <Cart
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
            onClose={() => setShowCart(false)}
          />
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Complete Your Order
              </h2>
              
              <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ordering as: <span className="font-bold text-sky-600 dark:text-sky-400\">
                    {customer.first_name} {customer.last_name}
                  </span>
                </p>
              </div>
              
              <div className="space-y-4 mb-6\">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Apartment/Room Number *
                  </label>
                  <input
                    type="text"
                    value={apartmentNumber}
                    onChange={(e) => setApartmentNumber(e.target.value)}
                    placeholder="A-101"
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special requests..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-sky-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitOrder}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Order History Modal */}
        {showOrderHistory && (
          <OrderHistoryModal
            orders={allOrders}
            onClose={() => setShowOrderHistory(false)}
          />
        )}
      </div>
    </div>
  );
};
