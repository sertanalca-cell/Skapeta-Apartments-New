import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export const TestWhatsApp = () => {
  const [testResult, setTestResult] = useState('');

  const testWhatsAppMessage = () => {
    // Sample order object
    const sampleOrder = {
      order_number: 1234,
      first_name: "John",
      last_name: "Doe",
      phone: "+355123456789",
      apartment_number: "A-305",
      items: [
        {
          menu_item_name: "Margherita Pizza",
          quantity: 2,
          price: 12.50
        },
        {
          menu_item_name: "Caesar Salad",
          quantity: 1,
          price: 8.00
        }
      ],
      total_price: 33.00,
      notes: "Extra cheese please"
    };

    // Format message (same logic as in FoodService.jsx)
    const itemsText = sampleOrder.items.map((item, idx) => 
      `${idx + 1}. ${item.menu_item_name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
    ).join('%0A');
    
    const message = 
      `🔔 *NEW ORDER*%0A%0A` +
      `📋 Order: *${sampleOrder.order_number}*%0A` +
      `👤 Customer: *${sampleOrder.first_name} ${sampleOrder.last_name}*%0A` +
      `📞 Phone: ${sampleOrder.phone}%0A` +
      `🏠 Room: *${sampleOrder.apartment_number}*%0A%0A` +
      `🍽️ *ITEMS:*%0A${itemsText}%0A%0A` +
      `💰 *TOTAL: €${sampleOrder.total_price.toFixed(2)}*%0A%0A` +
      `📝 Notes: ${sampleOrder.notes}%0A` +
      `⏰ ${new Date().toLocaleString('en-US')}`;

    const whatsappNumber = '00355693227207';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    setTestResult(`
WhatsApp URL Created:
Length: ${whatsappUrl.length} characters

Decoded Message Preview:
${decodeURIComponent(message)}

Full URL (click button below to open):
    `);

    console.log('WhatsApp URL:', whatsappUrl);
    console.log('Message:', decodeURIComponent(message));

    // Open WhatsApp
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
              WhatsApp Integration Test
            </h1>
            
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                Click the button below to test WhatsApp message with sample order data.
              </p>

              <Button
                onClick={testWhatsAppMessage}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              >
                📱 Test WhatsApp Message
              </Button>

              {testResult && (
                <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {testResult}
                  </pre>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Expected Behavior:
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>✅ WhatsApp should open automatically</li>
                  <li>✅ Chat with +355 69 322 7207 should open</li>
                  <li>✅ Message should be pre-filled with order details</li>
                  <li>✅ Message should include: Order number, customer name, items, total</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
