import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Clock, CheckCircle2, Truck, Package, ChevronDown, ChevronUp } from 'lucide-react';

export const OrderHistoryModal = ({ orders, onClose }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Your Orders
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div
                      className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                              #{order.order_number}
                            </span>
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{getStatusText(order.status)}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(order.created_at)}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • 
                            <span className="font-semibold text-lg text-slate-900 dark:text-white ml-2">
                              €{order.total_price.toFixed(2)}
                            </span>
                          </p>
                          {order.estimated_time && order.status !== 'delivered' && (
                            <div className="mt-2 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">Ready in ~{order.estimated_time} minutes</span>
                            </div>
                          )}
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Order Details:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-slate-700 dark:text-slate-300">
                                {item.quantity}x {item.menu_item_name}
                              </span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                €{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Special Instructions:
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {order.notes}
                            </p>
                          </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Delivering to: <span className="font-semibold text-slate-900 dark:text-white">
                              Apartment {order.apartment_number}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <Button onClick={onClose} className="w-full" variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
