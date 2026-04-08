import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { Clock, Package, Truck, CheckCircle2 } from 'lucide-react';

export const LiveOrderStatus = () => {
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    on_the_way: 0,
    delivered_today: 0
  });

  const loadStats = async () => {
    try {
      const orders = await ordersAPI.getAll();
      const today = new Date().toDateString();
      
      setStats({
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length,
        on_the_way: orders.filter(o => o.status === 'on_the_way').length,
        delivered_today: orders.filter(o => {
          return o.status === 'delivered' && 
                 new Date(o.updated_at).toDateString() === today;
        }).length
      });
    } catch (error) {
      console.error('Failed to load order stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
    // Refresh every 5 seconds
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusItems = [
    { 
      key: 'pending', 
      label: 'Pending', 
      count: stats.pending, 
      icon: Clock, 
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    { 
      key: 'preparing', 
      label: 'Preparing', 
      count: stats.preparing, 
      icon: Package, 
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    { 
      key: 'on_the_way', 
      label: 'On the Way', 
      count: stats.on_the_way, 
      icon: Truck, 
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      key: 'delivered_today', 
      label: 'Delivered Today', 
      count: stats.delivered_today, 
      icon: CheckCircle2, 
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    }
  ];

  const totalActive = stats.pending + stats.preparing + stats.on_the_way;

  if (totalActive === 0 && stats.delivered_today === 0) {
    return null; // Don't show if no orders
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fadeIn">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Order Status
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Updates every 5s
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={`${item.bgColor} rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`text-3xl font-bold ${item.textColor} animate-pulse`}>
                    {item.count}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {totalActive > 0 && (
          <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
            <p className="text-sm text-center text-sky-700 dark:text-sky-300 font-medium">
              🔔 {totalActive} active order{totalActive !== 1 ? 's' : ''} right now!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
