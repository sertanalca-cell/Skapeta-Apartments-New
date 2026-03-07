import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

export const ReservationInvoiceModal = ({ reservation, onClose, settings }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    // Calculate nights
    const checkIn = new Date(reservation.check_in);
    const checkOut = new Date(reservation.check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Format invoice for WhatsApp
    const invoiceText = `
🧾 *RESERVATION INVOICE*

📅 Date: ${formatDate(new Date())}

━━━━━━━━━━━━━━━━━━━━━━
*SKAPETA APARTMENTS*
Spiro Skapeta
Saranda, Albania
VAT: M34631808J
━━━━━━━━━━━━━━━━━━━━━━

*BILL TO:*
👤 ${reservation.guest_name}
📞 ${reservation.guest_phone}
${reservation.guest_email ? `📧 ${reservation.guest_email}` : ''}

━━━━━━━━━━━━━━━━━━━━━━
*RESERVATION DETAILS:*

🏠 Apartment: ${reservation.apartment_name}
📆 Check-in: ${reservation.check_in}
📆 Check-out: ${reservation.check_out}
🌙 Nights: ${nights}
👥 Guests: ${reservation.num_guests}

━━━━━━━━━━━━━━━━━━━━━━

*TOTAL AMOUNT:* €${reservation.total_price.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━

${reservation.notes ? `📝 Notes: ${reservation.notes}\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n` : ''}Thank you for choosing Skapeta Apartments! 🙏

_Skapeta Apartments_
_Saranda, Albania_
_VAT: M34631808J_
    `.trim();

    // Get guest phone number - clean it
    let guestPhone = reservation.guest_phone;
    if (!guestPhone) {
      alert('Guest phone number not available.');
      return;
    }

    // Remove any non-digit characters and ensure it starts with country code
    guestPhone = guestPhone.replace(/[^0-9+]/g, '');
    if (!guestPhone.startsWith('+') && !guestPhone.startsWith('00')) {
      // If no country code, assume Albanian number
      guestPhone = '355' + guestPhone.replace(/^0+/, '');
    } else if (guestPhone.startsWith('+')) {
      guestPhone = guestPhone.substring(1);
    } else if (guestPhone.startsWith('00')) {
      guestPhone = guestPhone.substring(2);
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(invoiceText);
    
    // Use WhatsApp API URL that works better on all devices
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${guestPhone}&text=${encodedMessage}`;
    
    // Detect iOS for better compatibility
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
      // iOS: Direct navigation works better
      window.location.href = whatsappUrl;
    } else {
      // Desktop/Android: Open in new tab
      window.open(whatsappUrl, '_blank');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate nights
  const checkIn = new Date(reservation.check_in);
  const checkOut = new Date(reservation.check_out);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold text-slate-900">Reservation Invoice</h2>
          <div className="flex gap-2">
            <Button 
              onClick={handleSendWhatsApp} 
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <span className="mr-2">💬</span>
              Send via WhatsApp
            </Button>
            <Button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-600 text-white">
              Print Invoice
            </Button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto bg-white">
            {/* Logo & Business Info */}
            <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
              {settings?.logo_url && (
                <img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  className="h-16 mx-auto mb-4"
                />
              )}
              <h1 className="text-3xl font-bold text-slate-900 mb-2">SKAPETA APARTMENTS</h1>
              <p className="text-slate-600">Spiro Skapeta</p>
              <p className="text-slate-600">Saranda, Albania</p>
              <p className="text-slate-600 font-semibold">VAT: M34631808J</p>
            </div>

            {/* Invoice Details */}
            <div className="mb-8">
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Bill To:</h3>
                  <p className="text-lg font-semibold text-slate-900">{reservation.guest_name}</p>
                  <p className="text-slate-600">{reservation.guest_phone}</p>
                  {reservation.guest_email && (
                    <p className="text-slate-600">{reservation.guest_email}</p>
                  )}
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Invoice Date:</h3>
                  <p className="text-slate-900">{formatDate(new Date())}</p>
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Reservation Details</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 mb-1">Apartment:</p>
                  <p className="font-semibold text-slate-900">{reservation.apartment_name}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Number of Guests:</p>
                  <p className="font-semibold text-slate-900">{reservation.num_guests}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Check-in:</p>
                  <p className="font-semibold text-slate-900">{reservation.check_in}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Check-out:</p>
                  <p className="font-semibold text-slate-900">{reservation.check_out}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Number of Nights:</p>
                  <p className="font-semibold text-slate-900">{nights}</p>
                </div>
              </div>
              {reservation.notes && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-slate-600 mb-1">Notes:</p>
                  <p className="text-slate-700">{reservation.notes}</p>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="border-t-2 border-slate-300 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-slate-700">Total Amount:</span>
                <span className="text-3xl font-bold text-green-600">€{reservation.total_price.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
              <p className="mb-2">Thank you for choosing Skapeta Apartments!</p>
              <p>Saranda, Albania | VAT: M34631808J</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
