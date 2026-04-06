import React from 'react';
import { CheckCircle2, Clock, Package, Truck, XCircle } from 'lucide-react';

export const OrderStatusTracker = ({ order }) => {
  if (!order) return null;

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

  const getLineColor = (stepIndex) => {
    const stepStatus = getStepStatus(stepIndex);
    if (stepStatus === 'completed') return 'bg-green-500';
    if (stepStatus === 'cancelled') return 'bg-red-500';
    return 'bg-slate-300 dark:bg-slate-600';
  };

  if (isCancelled) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="flex items-center justify-center gap-3 text-red-600 dark:text-red-400">
          <XCircle className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">Order Cancelled</h3>
            <p className="text-sm">Order #{order.order_number} has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-sky-200 dark:border-sky-800 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Order #{order.order_number}
          </h3>
          {order.estimated_time && currentIndex < statusOrder.indexOf('delivered') && (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">~{order.estimated_time} min</span>
            </div>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Track your order status in real-time
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-slate-300 dark:bg-slate-600" />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const StepIcon = step.icon;
            
            return (
              <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                {/* Circle with icon */}
                <div className={`
                  w-16 h-16 rounded-full border-4 flex items-center justify-center
                  transition-all duration-500 transform
                  ${getStepColor(stepStatus)}
                  ${stepStatus === 'active' ? 'scale-110 shadow-lg' : ''}
                `}>
                  <StepIcon className="w-8 h-8" />
                </div>
                
                {/* Label */}
                <span className={`
                  text-sm font-medium text-center
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
        <div className="absolute top-8 left-0 right-0 h-1 flex">
          {steps.slice(0, -1).map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-full transition-all duration-500 ${getLineColor(index)}`}
              style={{
                width: `${100 / (steps.length - 1)}%`
              }}
            />
          ))}
        </div>
      </div>

      {/* Status message */}
      <div className="mt-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          {currentIndex === statusOrder.indexOf('delivered') && '🎉 Your order has been delivered! Enjoy!'}
          {currentIndex === statusOrder.indexOf('on_the_way') && '🚗 Your order is on the way!'}
          {currentIndex === statusOrder.indexOf('preparing') && '👨‍🍳 Your order is being prepared'}
          {currentIndex === statusOrder.indexOf('accepted') && '✅ Your order has been accepted'}
          {currentIndex === statusOrder.indexOf('pending') && '⏳ Waiting for confirmation'}
        </p>
      </div>
    </div>
  );
};
