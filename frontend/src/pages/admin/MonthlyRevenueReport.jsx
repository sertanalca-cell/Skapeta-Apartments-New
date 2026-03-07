import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Download, TrendingUp, ShoppingBag, Calendar, FileText } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export const MonthlyRevenueReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

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
    
    // Logo (if available - placeholder for now)
    // You can add actual logo here: doc.addImage(logoBase64, 'PNG', x, y, width, height);
    
    // Company Name
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('SKAPETA APARTMENTS', pageWidth / 2, 20, { align: 'center' });
    
    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Monthly Revenue Report', pageWidth / 2, 32, { align: 'center' });
    
    // Month
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    doc.text(monthName, pageWidth / 2, 42, { align: 'center' });
    
    // Date generated
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 50, { align: 'center' });
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(15, 54, pageWidth - 15, 54);
    
    let yPos = 67;
    
    // Food Orders Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('🍽️ Food Orders', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Orders: ${report.food_orders_count}`, 20, yPos);
    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text(`Total: €${report.food_orders_total.toFixed(2)}`, 20, yPos);
    yPos += 12;
    
    // Manual Reservations Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('🏠 Manual Reservations', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Reservations: ${report.manual_reservations_count}`, 20, yPos);
    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text(`Total: €${report.manual_reservations_total.toFixed(2)}`, 20, yPos);
    yPos += 12;
    
    // Booking.com Reservations Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('🌐 Booking.com Reservations', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Reservations: ${report.booking_reservations_count}`, 20, yPos);
    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text(`Total: €${report.booking_reservations_total.toFixed(2)}`, 20, yPos);
    yPos += 15;
    
    // Total Section
    doc.setLineWidth(1);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('💰 TOTAL REVENUE', 15, yPos);
    doc.setFontSize(20);
    doc.text(`€${report.total_revenue.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
    yPos += 15;
    
    doc.setLineWidth(1);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 12;
    
    // Summary
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const totalTransactions = report.food_orders_count + report.manual_reservations_count + report.booking_reservations_count;
    doc.text(`Total Transactions: ${totalTransactions}`, 15, yPos);
    yPos += 6;
    
    if (totalTransactions > 0) {
      const avgTransaction = report.total_revenue / totalTransactions;
      doc.text(`Average Transaction: €${avgTransaction.toFixed(2)}`, 15, yPos);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Skapeta Apartments - Financial Report', pageWidth / 2, 280, { align: 'center' });
    
    // Save PDF
    doc.save(`revenue-report-${selectedMonth}.pdf`);
    toast.success('PDF downloaded successfully');
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
