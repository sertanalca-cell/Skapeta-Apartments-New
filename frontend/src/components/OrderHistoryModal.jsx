import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Clock, CheckCircle2, Truck, Package, ChevronDown, ChevronUp, XCircle } from 'lucide-react';

export const OrderHistoryModal = ({ orders, onClose }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'accepted': return 'bg-blue-500 text-white';
      case 'preparing': return 'bg-orange-500 text-white';
      case 'on_the_way': return 'bg-purple-500 text-white';
      case 'delivered': return 'bg-green-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'on_the_way': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'preparing': 'Preparing',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Order status tracker component
  const OrderTracker = ({ order }) => {
    const steps = [
      { key: 'pending', label: 'Pending', icon: Clock },
      { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
      { key: 'preparing', label: 'Preparing', icon: Package },
      { key: 'on_the_way', label: 'On the Way', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
    ];

    const statusOrder = ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';

    const getStepStatus = (stepIndex) => {
      if (isCancelled) return 'cancelled';
      if (stepIndex < currentIndex) return 'completed';
      if (stepIndex === currentIndex) return 'active';
      return 'pending';
    };

    const getStepColor = (status) => {
      switch (status) {
        case 'completed': return 'bg-green-500 text-white border-green-500';
        case 'active': return 'bg-sky-500 text-white border-sky-500 animate-pulse';
        case 'cancelled': return 'bg-red-500 text-white border-red-500';
        default: return 'bg-slate-200 text-slate-400 border-slate-300 dark:bg-slate-700 dark:text-slate-500 dark:border-slate-600';
      }
    };

    if (isCancelled) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mt-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Order Cancelled</span>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-sky-200 dark:border-sky-800">
        {/* Progress bar */}
        <div className="relative mb-6">
          {/* Background line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-slate-300 dark:bg-slate-600" />
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(index);
              const StepIcon = step.icon;
              
              return (
                <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
                  <div className={`
                    w-12 h-12 rounded-full border-3 flex items-center justify-center
                    transition-all duration-500 transform bg-white dark:bg-slate-800
                    ${getStepColor(stepStatus)}
                    ${stepStatus === 'active' ? 'scale-110 shadow-lg' : ''}
                  `}>
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <span className={`
                    text-xs font-medium text-center max-w-[60px]
                    ${stepStatus === 'active' ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}
                    ${stepStatus === 'completed' ? 'text-green-600 dark:text-green-400' : ''}
                    ${stepStatus === 'pending' ? 'text-slate-400 dark:text-slate-500' : ''}
                  `}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress line segments */}
          <div className="absolute top-6 left-0 right-0 h-1 flex">
            {steps.slice(0, -1).map((_, index) => {
              const stepStatus = getStepStatus(index);
              const lineColor = stepStatus === 'completed' ? 'bg-green-500' : 
                               stepStatus === 'cancelled' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600';
              return (
                <div
                  key={index}
                  className={`flex-1 h-full transition-all duration-500 ${lineColor}`}
                />
              );
            })}
          </div>
        </div>

        {/* Status message */}
        {order.estimated_time && currentIndex < statusOrder.indexOf('delivered') && (
          <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">Estimated: ~{order.estimated_time} minutes</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-sky-500 to-blue-600">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-7 h-7" />
              My Orders
            </h2>
            <p className="text-sky-100 text-sm mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''} • Live updates enabled
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-sky-100 transition-colors bg-white/20 hover:bg-white/30 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No orders yet</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Your orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card 
                  key={order.id} 
                  className="overflow-hidden border-2 hover:border-sky-300 transition-all hover:shadow-lg"
                >
                  <CardContent className="p-0">
                    <div
                      className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                              #{order.order_number}
                            </span>
                            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1.5`}>
                              {getStatusIcon(order.status)}
                              <span>{getStatusText(order.status)}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(order.created_at)}
                          </p>
                          <div className="mt-3 flex items-center gap-4 flex-wrap">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                            <span className="font-bold text-xl text-slate-900 dark:text-white">
                              €{order.total_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-1">
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-6 h-6" />
                          ) : (
                            <ChevronDown className="w-6 h-6" />
                          )}
                        </button>
                      </div>

                      {/* Order Tracker - Always visible */}
                      <OrderTracker order={order} />
                    </div>

                    {expandedOrder === order.id && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Package className="w-5 h-5 text-sky-600" />
                          Order Details
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-white dark:bg-slate-800 p-3 rounded-lg">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {item.quantity}x {item.menu_item_name}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                €{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Special Instructions:
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-lg">
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

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
