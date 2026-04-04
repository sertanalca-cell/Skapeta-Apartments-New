import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Download, TrendingUp, ShoppingBag, Calendar, FileText } from 'lucide-react';
import { reportsAPI, settingsAPI } from '../../services/api';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const MonthlyRevenueReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsAPI.get();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsAPI.getMonthlyRevenue(selectedMonth);
      setReport(data);
      toast.success('Report loaded successfully');
    } catch (error) {
      toast.error('Failed to load report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!report) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Define colors
    const primaryColor = [41, 128, 185]; // Professional blue
    const secondaryColor = [52, 73, 94]; // Dark gray
    const successColor = [39, 174, 96]; // Green
    const lightGray = [236, 240, 241];
    
    let yPos = 20;

    // HEADER SECTION
    // Add logo if available
    if (settings?.logo_url) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = settings.logo_url;
        await new Promise((resolve) => {
          img.onload = () => {
            doc.addImage(img, 'PNG', 15, yPos, 40, 20);
            resolve();
          };
          img.onerror = () => resolve(); // Skip if logo fails to load
        });
      } catch (error) {
        console.error('Logo load failed:', error);
      }
    }
    
    // Company info (right side)
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text(settings?.company_name || 'SKAPETA APARTMENTS', pageWidth - 15, yPos + 5, { align: 'right' });
    
    if (settings?.tax_number) {
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`Tax No: ${settings.tax_number}`, pageWidth - 15, yPos + 12, { align: 'right' });
    }
    
    doc.setFontSize(9);
    doc.text(`${settings?.address || 'Saranda, Albania'}`, pageWidth - 15, yPos + 17, { align: 'right' });
    
    yPos = 50;

    // TITLE BOX
    doc.setFillColor(...primaryColor);
    doc.rect(0, yPos, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('MONTHLY REVENUE REPORT', pageWidth / 2, yPos + 10, { align: 'center' });
    
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(monthName.toUpperCase(), pageWidth / 2, yPos + 18, { align: 'center' });
    
    yPos = 85;

    // SUMMARY CARDS
    const cardWidth = (pageWidth - 45) / 3;
    const cardData = [
      { label: 'Total Revenue', value: `€${report.total_revenue.toFixed(2)}`, color: successColor },
      { label: 'Food Orders', value: report.food_orders_count, color: primaryColor },
      { label: 'Reservations', value: report.manual_reservations_count + report.booking_reservations_count, color: secondaryColor }
    ];
    
    cardData.forEach((card, index) => {
      const x = 15 + (index * (cardWidth + 7.5));
      
      // Card background
      doc.setFillColor(...lightGray);
      doc.roundedRect(x, yPos, cardWidth, 22, 2, 2, 'F');
      
      // Value
      doc.setTextColor(...card.color);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(String(card.value), x + cardWidth / 2, yPos + 10, { align: 'center' });
      
      // Label
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(card.label, x + cardWidth / 2, yPos + 17, { align: 'center' });
    });
    
    yPos = 115;
    
    // FOOD ORDERS TABLE
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('🍽️ Food Service Revenue', 15, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total Orders', report.food_orders_count.toString()],
        ['Total Revenue', `€${report.food_orders_total.toFixed(2)}`],
        ['Average Order Value', `€${report.food_orders_count > 0 ? (report.food_orders_total / report.food_orders_count).toFixed(2) : '0.00'}`]
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: secondaryColor
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold' },
        1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', textColor: successColor }
      },
      margin: { left: 15, right: 15 }
    });
    
    yPos = doc.lastAutoTable.finalY + 10;

    // MANUAL RESERVATIONS TABLE
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('🏠 Manual Reservations', 15, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total Reservations', report.manual_reservations_count.toString()],
        ['Total Revenue', `€${report.manual_reservations_total.toFixed(2)}`]
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: secondaryColor
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold' },
        1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', textColor: successColor }
      },
      margin: { left: 15, right: 15 }
    });
    
    yPos = doc.lastAutoTable.finalY + 10;

    // BOOKING.COM RESERVATIONS TABLE
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('🌐 Booking.com Reservations', 15, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total Reservations', report.booking_reservations_count.toString()],
        ['Total Revenue', `€${report.booking_reservations_total.toFixed(2)}`]
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: secondaryColor
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold' },
        1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', textColor: successColor }
      },
      margin: { left: 15, right: 15 }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;

    // TOTAL REVENUE BOX (Highlighted)
    doc.setFillColor(...successColor);
    doc.roundedRect(15, yPos, pageWidth - 30, 18, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('TOTAL MONTHLY REVENUE', pageWidth / 2, yPos + 8, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(`€${report.total_revenue.toFixed(2)}`, pageWidth / 2, yPos + 15, { align: 'center' });

    // FOOTER
    const footerY = pageHeight - 15;
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    
    // Fix date format - use Turkish locale and correct timezone
    const now = new Date();
    const generatedDate = new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    
    doc.text(`Oluşturulma: ${generatedDate}`, 15, footerY);
    doc.text(`${settings?.company_name || 'Skapeta Apartments'}`, pageWidth - 15, footerY, { align: 'right' });

    // Save PDF
    const fileName = `Monthly_Revenue_Report_${selectedMonth}.pdf`;
    doc.save(fileName);
    toast.success('PDF downloaded successfully!');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Monthly Revenue Report
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              View and download financial reports
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full max-w-xs px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <Button
                onClick={fetchReport}
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-700 mt-6"
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Display */}
        {report && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-sky-200 dark:border-sky-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingBag className="w-8 h-8 text-sky-600" />
                    <span className="text-2xl font-bold text-sky-600">
                      {report.food_orders_count}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Food Orders
                  </h3>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    €{report.food_orders_total.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">
                      {report.manual_reservations_count}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Manual Reservations
                  </h3>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    €{report.manual_reservations_total.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {report.booking_reservations_count}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Booking.com
                  </h3>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    €{report.booking_reservations_total.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Total Revenue Card */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                        Total Revenue
                      </h3>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white">
                        €{report.total_revenue.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={downloadPDF}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Breakdown */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Revenue Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Food Orders</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {report.total_revenue > 0 
                        ? ((report.food_orders_total / report.total_revenue) * 100).toFixed(1) 
                        : '0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Manual Reservations</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {report.total_revenue > 0 
                        ? ((report.manual_reservations_total / report.total_revenue) * 100).toFixed(1) 
                        : '0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Booking.com</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {report.total_revenue > 0 
                        ? ((report.booking_reservations_total / report.total_revenue) * 100).toFixed(1) 
                        : '0'}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
