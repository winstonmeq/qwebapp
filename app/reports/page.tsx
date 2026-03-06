'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';


interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  totalEmergencies: number;
  byStatus: {
    pending: number;
    acknowledged: number;
    responding: number;
    resolved: number;
    cancelled: number;
  };
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byType: {
    medical: number;
    fire: number;
    police: number;
    flood: number;
    landslide: number;
    ambulance: number;
  };


  responseStats: {
    averageResponseTime: string;
    totalResponders: number;
    resolvedCount: number;
    resolutionRate: number;
  };
  topResponders: Array<{
    fName: string;
    count: number;
  }>;
  emergenciesList: Array<any>;
  municipality: Record<string, number>;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  const generateReport = async (type: 'weekly' | 'monthly' | 'custom', customDates?: { start: string; end: string }) => {
    setGenerating(true);
    setLoading(true);

    try {
      let startDate: Date;
      let endDate: Date;

      if (type === 'custom' && customDates) {
        startDate = new Date(customDates.start);
        endDate = new Date(customDates.end);
      } else if (type === 'weekly') {
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
        endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type
        })
      });

      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
      } else {
        alert('Failed to generate report: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };




const downloadPDF = async () => {
  if (!reportData) return;

  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // --- Header ---
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('EMERGENCY MANAGEMENT REPORT', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(reportData.period, pageWidth / 2, 28, { align: 'center' });
    
    // --- 1. Summary Table ---
    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Emergencies', reportData.totalEmergencies.toString()],
        ['Resolved Cases', reportData.byStatus.resolved.toString()],
        ['Resolution Rate', `${reportData.responseStats.resolutionRate}%`],
        ['Avg Response Time', reportData.responseStats.averageResponseTime],
      ],
      headStyles: { fillColor: [41, 128, 185] },
    });

    let finalY = (doc as any).lastAutoTable.finalY;

    // --- 2. Emergency Type Breakdown (NEW) ---
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Breakdown by Emergency Type', 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Emergency Type', 'Count', 'Percentage']],
      body: Object.entries(reportData.byType).map(([type, count]) => [
        type.replace('-', ' ').toUpperCase(),
        count.toString(),
        `${((count / reportData.totalEmergencies) * 100).toFixed(1)}%`
      ]),
      headStyles: { fillColor: [231, 76, 60] }, // Reddish for types
    });

    finalY = (doc as any).lastAutoTable.finalY;

    // --- 3. Municipality Breakdown (NEW) ---
    // Check if we need a new page for the next table
    if (finalY > 200) { doc.addPage(); finalY = 10; }

    finalY = (doc as any).lastAutoTable.finalY;

    // --- 4. Status Breakdown ---
    if (finalY > 220) { doc.addPage(); finalY = 10; }
    doc.setFontSize(14);
    doc.text('Status Overview', 14, finalY + 15);
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Status', 'Count']],
      body: Object.entries(reportData.byStatus).map(([k, v]) => [k.toUpperCase(), v.toString()]),
      headStyles: { fillColor: [127, 140, 141] },
    });

    // Save
    doc.save(`Emergency_Report_${reportData.period.replace(/\s+/g, '_')}.pdf`);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Failed to generate PDF. Check console for details.');
  }
};











  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="bg-gray-700 p-3 rounded-xl hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="text-white" size={24} />
              </Link>
              <div className="bg-green-600 p-3 rounded-xl">
                <FileText className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Emergency Reports
                </h1>
                <p className="text-gray-400 text-sm">
                  Generate weekly and monthly analytics reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Generator Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar size={24} className="text-green-400" />
                Generate Report
              </h2>

              <div className="space-y-6">
                {/* Quick Reports */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Quick Reports
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setReportType('weekly');
                        generateReport('weekly');
                      }}
                      disabled={generating}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar size={18} />
                      {generating && reportType === 'weekly' ? 'Generating...' : 'This Week'}
                    </button>
                    <button
                      onClick={() => {
                        setReportType('monthly');
                        generateReport('monthly');
                      }}
                      disabled={generating}
                      className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar size={18} />
                      {generating && reportType === 'monthly' ? 'Generating...' : 'This Month'}
                    </button>
                  </div>
                </div>

                {/* Custom Date Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Custom Date Range
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (customStart && customEnd) {
                          generateReport('custom', { start: customStart, end: customEnd });
                        } else {
                          alert('Please select both start and end dates');
                        }
                      }}
                      disabled={generating || !customStart || !customEnd}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      {generating ? 'Generating...' : 'Generate Custom Report'}
                    </button>
                  </div>
                </div>

                {/* Export Options */}
                {reportData && (
                  <div className="pt-4 border-t border-gray-700">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Export Report
                    </label>
                    <div className="space-y-2">
                   
                      <button
                        onClick={downloadPDF}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                        <Download size={18} />
                        Download PDF Report
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Report Display */}
          <div className="lg:col-span-2">
            {!reportData && !loading && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                <FileText className="mx-auto text-gray-600 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-white mb-2">No Report Generated</h3>
                <p className="text-gray-400">
                  Select a report type from the panel to generate analytics
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                <Activity className="mx-auto text-green-400 mb-4 animate-spin" size={64} />
                <h3 className="text-xl font-semibold text-white mb-2">Generating Report...</h3>
                <p className="text-gray-400">Please wait while we analyze the data</p>
              </div>
            )}

            {reportData && !loading && (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{reportData.period}</h2>
                    <span className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg">
                      {reportData.totalEmergencies} Total
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      {reportData.startDate}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      {reportData.endDate}
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Emergencies"
                    value={reportData.totalEmergencies.toString()}
                    icon={AlertTriangle}
                    color="bg-blue-600"
                  />
                  <MetricCard
                    title="Resolved"
                    value={reportData.byStatus.resolved.toString()}
                    icon={CheckCircle}
                    color="bg-green-600"
                  />
                  <MetricCard
                    title="Resolution Rate"
                    value={`${reportData.responseStats.resolutionRate}%`}
                    icon={TrendingUp}
                    color="bg-purple-600"
                  />
                  <MetricCard
                    title="Avg Response"
                    value={reportData.responseStats.averageResponseTime}
                    icon={Clock}
                    color="bg-orange-600"
                  />
                </div>

                {/* Status Breakdown */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-400" />
                    Emergencies by Status
                  </h3>
                  <div className="space-y-3">
                    <StatusBar label="Pending" value={reportData.byStatus.pending} total={reportData.totalEmergencies} color="bg-yellow-500" />
                    <StatusBar label="Acknowledged" value={reportData.byStatus.acknowledged} total={reportData.totalEmergencies} color="bg-blue-500" />
                    <StatusBar label="Responding" value={reportData.byStatus.responding} total={reportData.totalEmergencies} color="bg-purple-500" />
                    <StatusBar label="Resolved" value={reportData.byStatus.resolved} total={reportData.totalEmergencies} color="bg-green-500" />
                    <StatusBar label="Cancelled" value={reportData.byStatus.cancelled} total={reportData.totalEmergencies} color="bg-gray-500" />
                  </div>
                </div>

                {/* Severity Breakdown */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-red-400" />
                    Emergencies by Severity
                  </h3>
                  <div className="space-y-3">
                    <StatusBar label="Critical" value={reportData.bySeverity.critical} total={reportData.totalEmergencies} color="bg-red-500" />
                    <StatusBar label="High" value={reportData.bySeverity.high} total={reportData.totalEmergencies} color="bg-orange-500" />
                    <StatusBar label="Medium" value={reportData.bySeverity.medium} total={reportData.totalEmergencies} color="bg-yellow-500" />
                    <StatusBar label="Low" value={reportData.bySeverity.low} total={reportData.totalEmergencies} color="bg-green-500" />
                  </div>
                </div>

                {/* Type Breakdown */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-purple-400" />
                    Emergencies by Type
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <TypeCard label="Medical" value={reportData.byType.medical} />
                    <TypeCard label="Fire" value={reportData.byType.fire} />
                    <TypeCard label="Flood" value={reportData.byType.flood} />
                    <TypeCard label="Landslide" value={reportData.byType.landslide} />
                    <TypeCard label="Ambulance" value={reportData.byType.ambulance} />
                    <TypeCard label="Police" value={reportData.byType.police} />
                  </div>
                </div>

                {/* Top Responders */}
                {/* {reportData.topResponders.length > 0 && (
                  <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Users size={20} className="text-green-400" />
                      Top Responders
                    </h3>
                    <div className="space-y-3">
                      {reportData.topResponders.map((responder, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="text-white font-medium">{responder.fName}</span>
                          </div>
                          <span className="text-gray-400">{responder.count} emergencies</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}











// Helper Components
function MetricCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="text-white" size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusBar({ label, value, total, color }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm text-gray-400">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TypeCard({ label, value }: any) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 text-center">
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-400 uppercase">{label}</p>
    </div>
  );
}
