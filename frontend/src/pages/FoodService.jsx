import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Search, Clock, CheckCircle2, Truck, Package, LogOut, User, Receipt, Plus, Minus, X } from 'lucide-react';
import { menuAPI, ordersAPI, settingsAPI } from '../services/api';
import { CustomerLoginModal } from '../components/CustomerLoginModal';
import { OrderHistoryModal } from '../components/OrderHistoryModal';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useOrderWebSocket } from '../hooks/useOrderWebSocket';
import { toast } from 'sonner';

export const FoodService = () => {
  const { customer, logout, loading: authLoading } = useCustomerAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCheckout, setShowCheckout] = useState(false);
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [ownerWhatsApp, setOwnerWhatsApp] = useState('');

  useEffect(() => {
    loadMenu();
    loadSettings();
  }, []);

  useEffect(() => {
    if (customer?.id) {
      loadCustomerOrders();
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

  const loadSettings = async () => {
    try {
      const settings = await settingsAPI.get();
      const cleanNumber = settings.whatsapp_number.replace(/[\s\-+]/g, '');
      setOwnerWhatsApp(cleanNumber);
      console.log('✅ WhatsApp number loaded:', cleanNumber);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setOwnerWhatsApp('00355693227207');
    }
  };

  const loadCustomerOrders = async () => {
    try {
      const orders = await ordersAPI.getByUserId(customer.id);
      setCustomerOrders(orders);
    } catch (error) {
      console.error('Failed to load customer orders:', error);
    }
  };

  const addToCart = (item) => {
    const existingItem = cartItems.find(ci => ci.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(ci =>
        ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    if (!customer) {
      setShowLoginModal(true);
      toast.error('Please login to place an order');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setShowCheckout(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!apartmentNumber.trim()) {
      toast.error('Please enter your apartment/room number');
      return;
    }

    try {
      const orderData = {
        user_id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone || '',
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
      
      toast.success('✅ Order received! Opening WhatsApp...', {
        duration: 3000
      });

      sendWhatsAppNotification(newOrder);

      // Reload customer orders
      loadCustomerOrders();

      setCartItems([]);
      setShowCheckout(false);
      setApartmentNumber('');
      setOrderNotes('');

    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to place order');
    }
  };

  const sendWhatsAppNotification = (order) => {
    console.log('🔍 DEBUG: Order object received:', JSON.stringify(order, null, 2));
    
    if (!ownerWhatsApp) {
      console.error('❌ WhatsApp number not loaded');
      toast.error('WhatsApp number not loaded');
      return;
    }

    if (!order || !order.items || order.items.length === 0) {
      console.error('❌ Invalid order object or no items');
      toast.error('Cannot send notification: Invalid order data');
      return;
    }

    const itemsText = order.items.map((item, idx) => 
      `${idx + 1}. ${item.menu_item_name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
    ).join('%0A');
    
    const orderNumber = order.order_number || order.id || 'N/A';
    const customerName = `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Guest';
    const phone = order.phone || 'N/A';
    const room = order.apartment_number || 'N/A';
    const total = order.total_price ? order.total_price.toFixed(2) : '0.00';
    const notes = order.notes || 'None';
    const time = new Date().toLocaleString('en-US');
    
    const message = 
      `🔔 *NEW ORDER*%0A%0A` +
      `📋 Order: *${orderNumber}*%0A` +
      `👤 Customer: *${customerName}*%0A` +
      `📞 Phone: ${phone}%0A` +
      `🏠 Room: *${room}*%0A%0A` +
      `🍽️ *ITEMS:*%0A${itemsText}%0A%0A` +
      `💰 *TOTAL: €${total}*%0A%0A` +
      `📝 Notes: ${notes}%0A` +
      `⏰ ${time}`;
    
    const cleanNumber = ownerWhatsApp.replace(/[\s\-+]/g, '');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    console.log('✅ Opening WhatsApp...');
    console.log('📱 Number:', cleanNumber);
    console.log('📱 Device: ' + (isMobile ? 'Mobile' : 'Desktop'));
    console.log('📝 Message preview (first 200 chars):', decodeURIComponent(message).substring(0, 200));
    
    if (isMobile) {
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
      console.log('🔗 Mobile URL length:', whatsappUrl.length);
      console.log('📲 Redirecting via window.location.href (mobile method)');
      window.location.href = whatsappUrl;
    } else {
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
      console.log('🔗 Desktop URL length:', whatsappUrl.length);
      console.log('💻 Opening in new tab (desktop method)');
      
      try {
        const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          const link = document.createElement('a');
          link.href = whatsappUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => document.body.removeChild(link), 100);
        }
        console.log('✅ WhatsApp opened successfully');
      } catch (error) {
        console.error('❌ Error opening WhatsApp:', error);
        window.location.href = whatsappUrl;
      }
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pt-20 pb-32">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Food Service
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Order delicious meals to your room</p>
          </div>
          <div className="flex items-center gap-3">
            {customer ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowOrderHistory(true)}
                  className="hidden sm:flex"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  My Orders
                </Button>
                <Button variant="outline" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowLoginModal(true)} className="bg-sky-500 hover:bg-sky-600">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-sky-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:border-sky-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items - Compact Horizontal Cards */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No menu items found</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                          <span className="text-3xl">🍽️</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 py-3 pr-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                              €{item.price.toFixed(2)}
                            </span>
                            <Badge className="bg-sky-100 text-sky-700 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Add Button */}
                        <Button
                          onClick={() => addToCart(item)}
                          size="sm"
                          className="bg-sky-500 hover:bg-sky-600 text-white flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Fixed Bottom Bar - Cart (Left) + Create Order (Center) */}
        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-sky-500 shadow-2xl z-40">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Cart Summary - BIGGER */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-sky-600" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      Your Cart
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                      {cartCount} {cartCount === 1 ? 'item' : 'items'}
                    </span>
                    <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                      €{cartTotal.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Center: Create Order Button - BIGGER & PROMINENT */}
                <Button
                  onClick={handleCheckout}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg px-12 py-7 shadow-xl transform hover:scale-105 transition-all"
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  Create Order
                </Button>

                {/* Right: Cart Items Preview (desktop only) */}
                <div className="hidden lg:flex items-center gap-2 flex-1 overflow-x-auto max-w-md">
                  {cartItems.slice(0, 2).map(item => (
                    <div key={item.id} className="flex items-center gap-1 bg-sky-100 dark:bg-sky-900/30 rounded-full px-4 py-2 text-sm whitespace-nowrap">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                      <Badge className="bg-sky-500 text-white text-xs">{item.quantity}</Badge>
                    </div>
                  ))}
                  {cartItems.length > 2 && (
                    <span className="text-sm text-slate-500 font-medium">+{cartItems.length - 2} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile-Optimized Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full shadow-2xl max-h-[95vh] overflow-y-auto">
              <div className="p-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Complete Your Order
                  </h2>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Total Display */}
                <div className="mb-6 p-5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl border-2 border-sky-200 dark:border-sky-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base text-slate-600 dark:text-slate-400 font-medium">{cartCount} items in cart</p>
                      <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                        €{cartTotal.toFixed(2)}
                      </p>
                    </div>
                    <ShoppingCart className="w-10 h-10 text-sky-500" />
                  </div>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleSubmitOrder} className="space-y-5">
                  <div>
                    <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Room / Apartment Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={apartmentNumber}
                      onChange={(e) => setApartmentNumber(e.target.value)}
                      placeholder="e.g., A-101, Room 205"
                      className="w-full px-4 py-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any special requests..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none resize-none text-base"
                    />
                  </div>

                  {/* MOBILE-FRIENDLY BUTTONS - ALWAYS VISIBLE */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      className="w-full sm:flex-1 py-7 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-xl order-1 sm:order-2"
                    >
                      <CheckCircle2 className="w-6 h-6 mr-2" />
                      Place Order
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCheckout(false)}
                      className="w-full sm:flex-1 py-7 text-lg order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>

                {/* Cart Items Summary */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {cartItems.length} item(s) • Total: €{cartTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <CustomerLoginModal
            onClose={() => setShowLoginModal(false)}
          />
        )}

        {/* Order History Modal */}
        {showOrderHistory && (
          <OrderHistoryModal
            orders={customerOrders}
            onClose={() => setShowOrderHistory(false)}
          />
        )}
      </div>
    </div>
  );
};
