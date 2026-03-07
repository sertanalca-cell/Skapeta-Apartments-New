import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

export const InvoiceModal = ({ order, onClose, settings }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    // Format invoice for WhatsApp
    const invoiceText = `
🧾 *INVOICE #${order.order_number}*

📅 Date: ${formatDate(order.created_at)}

━━━━━━━━━━━━━━━━━━━━━━
*SKAPETA APARTMENTS*
Spiro Skapeta
Saranda, Albania
VAT: M34631808J
━━━━━━━━━━━━━━━━━━━━━━

*BILL TO:*
👤 ${order.first_name} ${order.last_name}
📞 ${order.phone || 'N/A'}
🏠 Apartment ${order.apartment_number}

━━━━━━━━━━━━━━━━━━━━━━
*ORDER ITEMS:*

${order.items.map((item, idx) => 
  `${idx + 1}. ${item.menu_item_name}
   Qty: ${item.quantity} × €${item.price.toFixed(2)} = €${(item.price * item.quantity).toFixed(2)}`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━

*Subtotal:* €${order.total_price.toFixed(2)}
*TOTAL:* €${order.total_price.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━

${order.notes ? `📝 Notes: ${order.notes}\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n` : ''}Thank you for your order! 🙏

_Skapeta Apartments_
_Saranda, Albania_
_VAT: M34631808J_
    `.trim();

    // Get customer phone number and clean it
    let customerPhone = order.phone;
    
    if (!customerPhone) {
      alert('Customer phone number not available. Please add phone number to send invoice via WhatsApp.');
      return;
    }

    // Clean phone number - remove all non-digit characters except +
    customerPhone = customerPhone.replace(/[^0-9+]/g, '');
    
    // Handle different phone number formats
    if (!customerPhone.startsWith('+') && !customerPhone.startsWith('00')) {
      // If no country code, assume Albanian number (+355)
      customerPhone = '355' + customerPhone.replace(/^0+/, '');
    } else if (customerPhone.startsWith('+')) {
      // Remove + sign (WhatsApp API doesn't need it)
      customerPhone = customerPhone.substring(1);
    } else if (customerPhone.startsWith('00')) {
      // Convert 00 format to just digits
      customerPhone = customerPhone.substring(2);
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(invoiceText);
    
    // Create WhatsApp URL - try native app first
    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodedMessage}`;
    
    // Create a temporary link and click it (works best on all devices including iPhone)
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Append to body, click, and remove (required for iOS)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header - Hide when printing */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold text-slate-900">Invoice #{order.order_number}</h2>
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
          <div className="max-w-3xl mx-auto bg-white" id="invoice-content">
            {/* Company Header */}
            <div className="border-b-2 border-sky-500 pb-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  {settings?.logo_url && (
                    <img 
                      src={settings.logo_url} 
                      alt="Logo" 
                      className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-sky-500"
                    />
                  )}
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Skapeta Apartments</h1>
                  <p className="text-lg font-semibold text-slate-700">Spiro Skapeta</p>
                  <p className="text-slate-600">Saranda, Albania</p>
                  <p className="text-slate-600 font-medium mt-2">VAT: M34631808J</p>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-bold text-sky-600 mb-2">INVOICE</h2>
                  <p className="text-lg font-semibold text-slate-900">#{order.order_number}</p>
                  <p className="text-sm text-slate-600 mt-2">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Bill To:</h3>
              <p className="text-lg font-semibold text-slate-900">{order.first_name} {order.last_name}</p>
              {order.phone && <p className="text-slate-600">Phone: {order.phone}</p>}
              <p className="text-slate-600">Apartment: {order.apartment_number}</p>
            </div>

            {/* Order Items Table */}
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Item</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-700">Qty</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Price</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="py-3 px-2 text-slate-900">{item.menu_item_name}</td>
                    <td className="py-3 px-2 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-2 text-right text-slate-700">€{item.price.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-semibold text-slate-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold text-slate-900">€{order.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-slate-300">
                  <span className="text-lg font-bold text-slate-900">Total:</span>
                  <span className="text-2xl font-bold text-sky-600">€{order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-700 mb-2">Notes:</h3>
                <p className="text-slate-600">{order.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-6 border-t border-slate-200">
              <p className="text-slate-600 text-sm">Thank you for your order!</p>
              <p className="text-slate-500 text-xs mt-2">
                Skapeta Apartments • Saranda, Albania • VAT: M34631808J
              </p>
            </div>
          </div>
        </div>

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
    </div>
  );
};
