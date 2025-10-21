/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import { format, subDays } from 'date-fns';
import { Calendar, FileDown, Printer, BarChart, ServerCrash, Utensils } from 'lucide-react';
import { CSVLink } from 'react-csv';

import useAxiosSecure from '../../../hooks/useAxiosSecure';
import 'react-datepicker/dist/react-datepicker.css';

// --- Type Definitions (Improved for Type Safety) ---
type ReportType = 'sales' | 'orders' | 'users';

interface SalesReportRow {
    date: string;
    orders: number;
    revenue: number;
}

interface OrderReportRow {
    _id: string;
    user_email: string;
    status: string;
    total_amount: number;
}

interface UserReportRow {
    _id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

type ReportDetails = SalesReportRow[] | OrderReportRow[] | UserReportRow[];

interface ReportData {
    summary: Record<string, number | string>;
    details: ReportDetails;
}

// --- Reusable UI Components ---
const ReportControl = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {children}
        </div>
    </div>
);

const SummaryCard = ({ title, value, format = 'number' }: { title: string, value: string | number }) => {
    const formattedValue = format === 'currency' ? `৳${Number(value).toLocaleString('en-IN')}` : Number(value).toLocaleString('en-IN');
    return (
        <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-500 font-medium capitalize">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{formattedValue}</p>
        </div>
    );
};

// --- Main Reports Component ---
const Reports = () => {
    const [reportType, setReportType] = useState<ReportType>('sales');
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [enabled, setEnabled] = useState(false);

    const axiosSecure = useAxiosSecure();

    const { data: reportData, isLoading, isError, error, refetch } = useQuery<ReportData, Error>({
        queryKey: ['reports', reportType, startDate, endDate],
        queryFn: async () => {
            const from = format(startDate, 'yyyy-MM-dd');
            const to = format(endDate, 'yyyy-MM-dd');
            // 100% FIX: Removed '/api' prefix as axiosSecure already includes it.
            const res = await axiosSecure.get(`/reports/${reportType}`, { params: { from, to } });
            return res.data.data || res.data;
        },
        enabled: enabled,
        refetchOnWindowFocus: false,
    });

    const handleGenerateReport = () => {
        setEnabled(true);
        refetch();
    };

    const handlePrint = () => {
        window.print();
    };

    const tableConfig = useMemo(() => {
        switch (reportType) {
            case 'sales':
                return {
                    headers: ['Date', 'Orders', 'Revenue'],
                    rows: (details: ReportDetails) => (details as SalesReportRow[]).map((row) => (
                        <tr key={row.date} className="tr">
                            <td className="td">{format(new Date(row.date), 'dd MMM, yyyy')}</td>
                            <td className="td">{row.orders}</td>
                            <td className="td text-right">৳{Number(row.revenue).toLocaleString('en-IN')}</td>
                        </tr>
                    ))
                };
            case 'orders':
                return {
                    headers: ['Order ID', 'Customer', 'Status', 'Amount'],
                    rows: (details: ReportDetails) => (details as OrderReportRow[]).map((row) => (
                        <tr key={row._id} className="tr">
                            <td className="td font-mono text-xs">{row._id}</td>
                            <td className="td">{row.user_email}</td>
                            <td className="td capitalize">{row.status}</td>
                            <td className="td text-right">৳{Number(row.total_amount).toLocaleString('en-IN')}</td>
                        </tr>
                    ))
                };
            case 'users':
                return {
                    headers: ['User Name', 'Email', 'Role', 'Joined On'],
                    rows: (details: ReportDetails) => (details as UserReportRow[]).map((row) => (
                        <tr key={row._id} className="tr">
                            <td className="td">{row.name}</td>
                            <td className="td">{row.email}</td>
                            <td className="td capitalize">{row.role}</td>
                            <td className="td">{format(new Date(row.created_at), 'dd MMM, yyyy')}</td>
                        </tr>
                    ))
                };
            default: return { headers: [], rows: () => null };
        }
    }, [reportType]);

    const csvData = useMemo(() => reportData?.details || [], [reportData]);

    return (
        <>
            <style>
                {`
                    .btn-secondary {
                        display: inline-flex; align-items: center; padding: 0.5rem 1rem;
                        background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db;
                        border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s;
                    }
                    .btn-secondary:hover { background-color: #e5e7eb; }
                    .th { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: bold; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; }
                    .td { padding: 0.75rem 1.5rem; font-size: 0.875rem; white-space: nowrap; }
                    .tr:hover { background-color: #f9fafb; }
                    @media print {
                        body * { visibility: hidden; }
                        #print-section, #print-section * { visibility: visible; }
                        #print-section { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none; }
                    }
                `}
            </style>
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 no-print">Generate Reports</h1>

                    <ReportControl>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                            <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF451C]/50">
                                <option value="sales">Sales Report</option>
                                <option value="orders">Order Summary</option>
                                <option value="users">User Report</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <DatePicker selected={startDate} onChange={(date: Date | null) => date && setStartDate(date)} className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <DatePicker selected={endDate} onChange={(date: Date | null) => date && setEndDate(date)} className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                        <button onClick={handleGenerateReport} disabled={isLoading} className="w-full bg-[#EF451C] text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center justify-center">
                            {isLoading ? <Utensils className="animate-spin mr-2" size={20} /> : <BarChart size={20} className="mr-2" />}
                            {isLoading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </ReportControl>

                    <div id="print-section">
                        {isError && (
                             <div className="flex flex-col justify-center items-center text-center bg-red-50 p-6 rounded-lg">
                                <ServerCrash className="text-red-500 mb-4" size={48} />
                                <h2 className="text-2xl font-bold mb-2 text-red-700">Failed to Generate Report</h2>
                                <p className="text-gray-500 max-w-md">{(error as any)?.message || 'An unknown error occurred.'}</p>
                            </div>
                        )}
                        
                        {!enabled && !isLoading && !isError && (
                             <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed">
                                 <Calendar size={48} className="mx-auto text-gray-400" />
                                 <p className="mt-4 text-gray-500">Select a report type and date range to get started.</p>
                             </div>
                        )}

                        {reportData && !isLoading && !isError && (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 capitalize">{reportType} Report</h2>
                                        <p className="text-gray-500">
                                            {format(startDate, 'dd MMM, yyyy')} - {format(endDate, 'dd MMM, yyyy')}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2 mt-4 md:mt-0 no-print">
                                        <CSVLink data={csvData} headers={tableConfig.headers} filename={`${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`} className="btn-secondary">
                                            <FileDown size={16} className="mr-2" /> Export CSV
                                        </CSVLink>
                                        <button onClick={handlePrint} className="btn-secondary">
                                            <Printer size={16} className="mr-2" /> Print
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {Object.entries(reportData.summary).map(([key, value]) => (
                                        <SummaryCard key={key} title={key.replace(/_/g, ' ')} value={value} />
                                    ))}
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>{tableConfig.headers.map(h => <th key={h} className="th">{h}</th>)}</tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">{tableConfig.rows(reportData.details)}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Reports;

