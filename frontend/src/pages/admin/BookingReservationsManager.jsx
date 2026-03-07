import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { bookingReservationsAPI } from '../../services/api';
import { toast } from 'sonner';

export const BookingReservationsManager = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    guest_name: '',
    check_in: '',
    check_out: '',
    nights: 1,
    price: 0,
    booking_reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await bookingReservationsAPI.getAll();
      setReservations(data);
    } catch (error) {
      toast.error('Failed to load booking reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await bookingReservationsAPI.update(editingId, formData);
        toast.success('Booking reservation updated');
      } else {
        await bookingReservationsAPI.create(formData);
        toast.success('Booking reservation added');
      }
      setShowModal(false);
      resetForm();
      fetchReservations();
    } catch (error) {
      toast.error('Failed to save booking reservation');
    }
  };

  const handleEdit = (reservation) => {
    setEditingId(reservation.id);
    setFormData({
      guest_name: reservation.guest_name,
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      nights: reservation.nights,
      price: reservation.price,
      booking_reference: reservation.booking_reference || '',
      notes: reservation.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking reservation?')) return;
    try {
      await bookingReservationsAPI.delete(id);
      toast.success('Booking reservation deleted');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to delete booking reservation');
    }
  };

  const resetForm = () => {
    setFormData({
      guest_name: '',
      check_in: '',
      check_out: '',
      nights: 1,
      price: 0,
      booking_reference: '',
      notes: ''
    });
    setEditingId(null);
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'check_in' || field === 'check_out') {
        updated.nights = calculateNights(
          field === 'check_in' ? value : prev.check_in,
          field === 'check_out' ? value : prev.check_out
        );
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Booking.com Reservations
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage reservations from Booking.com
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Booking Reservation
          </Button>
        </div>

        {reservations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No booking reservations yet. Add your first one!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {reservation.guest_name}
                        </h3>
                        {reservation.booking_reference && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                            Ref: {reservation.booking_reference}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Check-in</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {new Date(reservation.check_in).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Check-out</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {new Date(reservation.check_out).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Nights</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {reservation.nights}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Total Price</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            €{reservation.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {reservation.notes && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                          📝 {reservation.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(reservation)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(reservation.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {editingId ? 'Edit' : 'Add'} Booking Reservation
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guest_name}
                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Check-in *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.check_in}
                      onChange={(e) => handleDateChange('check_in', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Check-out *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.check_out}
                      onChange={(e) => handleDateChange('check_out', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nights
                    </label>
                    <input
                      type="number"
                      value={formData.nights}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Price (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Booking Reference
                  </label>
                  <input
                    type="text"
                    value={formData.booking_reference}
                    onChange={(e) => setFormData({ ...formData, booking_reference: e.target.value })}
                    placeholder="e.g., BK123456"
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    {editingId ? 'Update' : 'Add'} Reservation
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
