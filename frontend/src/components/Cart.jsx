import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';

export const Cart = ({ items, onUpdateQuantity, onRemove, onCheckout, onClose }) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <div className="fixed bottom-0 right-0 md:top-20 md:right-4 bg-white dark:bg-slate-800 shadow-2xl rounded-t-2xl md:rounded-2xl w-full md:w-96 z-40 border-2 border-sky-500">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Your Cart
            </h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Your cart is empty</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 md:top-20 md:right-4 bg-white dark:bg-slate-800 shadow-2xl rounded-t-2xl md:rounded-2xl w-full md:w-96 z-40 border-2 border-sky-500 max-h-[80vh] md:max-h-[calc(100vh-6rem)] flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Your Cart
          <Badge className="ml-2 bg-sky-500">{items.length}</Badge>
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{item.name}</h4>
                <p className="text-sky-600 dark:text-sky-400 font-bold mt-1">
                  €{item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-slate-900 dark:text-white">Total:</span>
          <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">€{total.toFixed(2)}</span>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-6 text-lg"
          onClick={onCheckout}
        >
          Send Order
        </Button>
      </div>
    </div>
  );
};
