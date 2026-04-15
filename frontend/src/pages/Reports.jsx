import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

export default function Reports() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and Pagination Data
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (currentUser) {
      fetchReports();
    }
  }, [currentUser]);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (data) setReports(data);
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Message', 'Scam Type', 'Confidence', 'Guidance'];
    const rows = filteredReports.map(r => [
      new Date(r.created_at).toLocaleString().replace(/,/g, ''),
      `"${r.message_text.replace(/"/g, '""')}"`,
      r.scam_type || 'Unknown',
      `${Math.round(r.confidence_score * 100)}%`,
      `"${r.guidance?.replace(/"/g, '""') || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'shieldai_threat_reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Processing
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.message_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || r.scam_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const uniqueScamTypes = ['All', ...new Set(reports.map(r => r.scam_type).filter(t => t && t !== 'None'))];

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getBadgeStyle = (type, confidence) => {
    if (!type || type === 'None') return 'bg-green-500/10 text-green-400 border border-green-500/20';
    if (confidence > 0.8) return 'bg-red-500/10 text-red-400 border border-red-500/30';
    return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Threat Reports</h1>
          <p className="text-gray-400 font-medium">View, search, and analyze your historical message scans.</p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={filteredReports.length === 0}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-5 py-2.5 rounded-lg border border-gray-600 transition-colors flex items-center shadow-lg disabled:opacity-50 space-x-2"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-gray-800/40 backdrop-blur rounded-2xl border border-gray-700/60 shadow-2xl overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-gray-700/50 bg-gray-800/80 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 relative">
            <svg className="w-5 h-5 text-gray-500 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text" 
              placeholder="Search specific message phrasing..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-11 pr-4 py-2.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-900 transition-all shadow-inner"
            />
          </div>
          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-all shadow-inner"
            >
              {uniqueScamTypes.map(type => (
                <option key={type} value={type} className="bg-gray-800">{type === 'All' ? 'All Treat Types' : type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/70 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
              <tr>
                <th className="px-6 py-5 whitespace-nowrap">Scan Date</th>
                <th className="px-6 py-5">Full Message Content</th>
                <th className="px-6 py-5 whitespace-nowrap">Detected Type</th>
                <th className="px-6 py-5 whitespace-nowrap text-center">AI Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-gray-800/10 border-b border-gray-700/30">
                    <td className="px-6 py-5"><div className="h-3 bg-gray-700 rounded w-24 mb-2"></div><div className="h-2 bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-5"><div className="h-3 bg-gray-700 rounded w-full max-w-sm mb-2"></div><div className="h-3 bg-gray-700 rounded w-2/3"></div></td>
                    <td className="px-6 py-5"><div className="h-5 bg-gray-700 rounded w-16 shadow-inner"></div></td>
                    <td className="px-6 py-5"><div className="flex items-center justify-center space-x-2"><div className="h-2 bg-gray-700 rounded-full w-12"></div><div className="h-3 bg-gray-700 rounded w-8"></div></div></td>
                  </tr>
                ))
              ) : paginatedReports.length === 0 ? (
                 <tr><td colSpan="4" className="text-center py-20 text-gray-500">No reports found matching your criteria.</td></tr>
              ) : (
                paginatedReports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-5 text-gray-400 whitespace-nowrap font-mono text-xs">
                      {new Date(r.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-5 text-gray-300 font-medium w-7/12 leading-relaxed">
                      <div className="line-clamp-2 hover:line-clamp-none transition-all">{r.message_text}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm ${getBadgeStyle(r.scam_type, r.confidence_score)}`}>
                        {r.scam_type && r.scam_type !== 'None' ? r.scam_type : 'Safe'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-300 whitespace-nowrap font-mono text-center">
                      {r.scam_type && r.scam_type !== 'None' ? (
                        <div className="flex items-center justify-center space-x-2">
                           <div className="w-12 bg-gray-700 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${r.confidence_score > 0.8 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${r.confidence_score * 100}%` }}></div></div>
                           <span>{(r.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      ) : <span className="text-gray-600">-</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Details */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-700/50 flex items-center justify-between bg-gray-900/40">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} results
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 disabled:opacity-30 transition-colors shadow-sm font-semibold"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 disabled:opacity-30 transition-colors shadow-sm font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
