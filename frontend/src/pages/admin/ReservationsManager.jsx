import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, Plus, Trash2, User, Phone, Mail, DollarSign, FileText, ExternalLink } from 'lucide-react';
import { ReservationInvoiceModal } from '../../components/ReservationInvoiceModal';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const ReservationsManager = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    apartment_id: '1',
    apartment_name: '',
    check_in: '',
    check_out: '',
    num_guests: 1,
    total_price: 0,
    notes: '',
  });

  useEffect(() => {
    loadReservations();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadReservations = async () => {
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      toast.success('Reservation created successfully');
      setShowForm(false);
      setFormData({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        apartment_id: '1',
        apartment_name: '',
        check_in: '',
        check_out: '',
        num_guests: 1,
        total_price: 0,
        notes: '',
      });
      loadReservations();
    } catch (error) {
      console.error('Failed to create reservation:', error);
      toast.error('Failed to create reservation');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      toast.success('Reservation deleted');
      loadReservations();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete reservation');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Reservations</h2>
            <p className="text-slate-600">Manage manual apartment reservations</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/admin/booking-reservations')}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Booking.com Reservations
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-sky-500 hover:bg-sky-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? 'Cancel' : 'New Reservation'}
            </Button>
          </div>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Reservation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Guest Name *</label>
                    <input
                      required
                      value={formData.guest_name}
                      onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <input
                      required
                      value={formData.guest_phone}
                      onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.guest_email}
                      onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Apartment Name *</label>
                    <input
                      required
                      value={formData.apartment_name}
                      onChange={(e) => setFormData({ ...formData, apartment_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Check-in *</label>
                    <input
                      type="date"
                      required
                      value={formData.check_in}
                      onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Check-out *</label>
                    <input
                      type="date"
                      required
                      value={formData.check_out}
                      onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Guests *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.num_guests}
                      onChange={(e) => setFormData({ ...formData, num_guests: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Price (€) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.total_price}
                      onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  Create Reservation
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-900">{reservation.guest_name}</h3>
                      <Badge className="bg-green-500">Confirmed</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4" />
                          <span>{reservation.apartment_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          <span>{reservation.guest_phone}</span>
                        </div>
                        {reservation.guest_email && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4" />
                            <span>{reservation.guest_email}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{reservation.check_in} → {reservation.check_out}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4" />
                          <span>{reservation.num_guests} guest(s)</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          <span>€{reservation.total_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    {reservation.notes && (
                      <p className="mt-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                        {reservation.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setShowInvoice(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Invoice
                    </Button>
                    <Button
                      onClick={() => handleDelete(reservation.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reservations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No reservations yet. Create your first one!</p>
            </CardContent>
          </Card>
        )}

        {/* Invoice Modal */}
        {showInvoice && selectedReservation && (
          <ReservationInvoiceModal
            reservation={selectedReservation}
            settings={settings}
            onClose={() => {
              setShowInvoice(false);
              setSelectedReservation(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};