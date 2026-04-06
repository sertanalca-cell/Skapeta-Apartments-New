import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Calendar, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { OrderEditModal } from './OrderEditModal';
import { toast } from 'sonner';
import { ordersAPI } from '../../services/api';

export const LastOrdersSection = ({ lastOrders, loadingOrders, onOrderDeleted, onOrderUpdated }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'on_the_way': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = lastOrders.filter(order => {
    if (!order.closed_at) return false;
    const closedDate = new Date(order.closed_at).toISOString().split('T')[0];
    return closedDate >= dateRange.start && closedDate <= dateRange.end;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const displayedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    try {
      await ordersAPI.delete(orderId);
      toast.success('Order deleted successfully');
      onOrderDeleted(orderId);
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error('Failed to delete order');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Last Orders (Closed)</h2>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Date:</span>
              </div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange({ ...dateRange, start: e.target.value });
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange({ ...dateRange, end: e.target.value });
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <Badge variant="outline" className="ml-auto">
                {filteredOrders.length} orders
              </Badge>
            </div>
          </div>

          {loadingOrders ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            </div>
          ) : displayedOrders.length > 0 ? (
            <div className="space-y-3">
              {displayedOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-slate-900 dark:text-white">
                        Order #{order.order_number}
                      </span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <p>
                        <span className="font-medium">Customer:</span> {order.first_name} {order.last_name}
                      </p>
                      <p>
                        <span className="font-medium">Apartment:</span> {order.apartment_number}
                      </p>
                      <p>
                        <span className="font-medium">Closed:</span> {formatDate(order.closed_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      €{order.total_price?.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(order.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {startIndex + 1}-{Math.min(startIndex + ordersPerPage, filteredOrders.length)} of {filteredOrders.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      size="sm"
                      variant="outline"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-3 py-2 text-sm font-medium text-slate-900 dark:text-white">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      size="sm"
                      variant="outline"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No closed orders in this date range</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {selectedOrder && (
        <OrderEditModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={(updatedOrder) => {
            onOrderUpdated(updatedOrder);
            setSelectedOrder(null);
          }}
        />
      )}
    </>
  );
};
