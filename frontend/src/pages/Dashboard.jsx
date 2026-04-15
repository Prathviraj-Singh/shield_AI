import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import LiveAlertFeed from '../components/LiveAlertFeed';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats derivation
  const totalScams = reports.filter(r => r.scam_type && r.scam_type !== 'None').length;
  const totalSafe = reports.length - totalScams;
  const highConfidence = reports.filter(r => r.confidence_score > 0.8).length;

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
      .order('created_at', { ascending: false })
      .limit(10); // Fetch top 10 for dashboard preview
    
    if (data) setReports(data);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-400">Overview of your recent threat scans and system alerts.</p>
        </div>
        <Link to="/scan" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 transform hover:-translate-y-0.5">
          <span>New Scan</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/60 backdrop-blur border border-gray-700/50 p-6 rounded-2xl shadow-xl flex items-center space-x-5 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none"></div>
           <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full shadow-inner">
             <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
           </div>
           <div>
             <p className="text-sm text-gray-400 font-semibold tracking-wide uppercase">Scams Detected</p>
             <h3 className="text-4xl font-black text-white mt-1">{totalScams}</h3>
           </div>
        </div>
        
        <div className="bg-gray-800/60 backdrop-blur border border-gray-700/50 p-6 rounded-2xl shadow-xl flex items-center space-x-5 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-xl pointer-events-none"></div>
           <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-full shadow-inner">
             <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
           </div>
           <div>
             <p className="text-sm text-gray-400 font-semibold tracking-wide uppercase">Safe Messages</p>
             <h3 className="text-4xl font-black text-white mt-1">{totalSafe}</h3>
           </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur border border-gray-700/50 p-6 rounded-2xl shadow-xl flex items-center space-x-5 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none"></div>
           <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-full shadow-inner">
             <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
           </div>
           <div>
             <p className="text-sm text-gray-400 font-semibold tracking-wide uppercase">High Risk Alerts</p>
             <h3 className="text-4xl font-black text-white mt-1">{highConfidence}</h3>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[500px]">
        {/* Reports Table (Left, 2 cols) */}
        <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur border border-gray-700/60 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-700/50 bg-gray-800/80 flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">Recent Scans</h3>
            <Link to="/reports" className="text-xs font-semibold text-blue-400 hover:text-blue-300 uppercase tracking-wider">View All</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <table className="w-full text-left text-sm mt-4">
                 <tbody className="divide-y divide-gray-700/50">
                    {Array(4).fill(0).map((_, i) => (
                       <tr key={i} className="animate-pulse">
                         <td className="px-6 py-5"><div className="h-3 bg-gray-700/80 rounded w-48 mb-2"></div><div className="h-3 bg-gray-700/80 rounded w-32"></div></td>
                         <td className="px-6 py-5"><div className="h-5 bg-gray-700/80 rounded w-16 shadow-inner"></div></td>
                         <td className="px-6 py-5"><div className="h-3 bg-gray-700/80 rounded w-20"></div></td>
                       </tr>
                    ))}
                 </tbody>
              </table>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center bg-grid-gray-800/[0.1] bg-[length:24px_24px]">
                <div className="bg-gray-800/80 p-4 rounded-full mb-4 shadow-inner">
                  <svg className="w-10 h-10 opacity-60 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <p className="font-semibold text-gray-400">No scans performed yet.</p>
                <p className="text-sm mt-1 mb-5 max-w-xs leading-relaxed">Protect yourself by scanning a suspicious message.</p>
                <Link to="/scan" className="text-white hover:text-white font-medium px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-gray-600 shadow-sm text-sm">Run your first threat scan</Link>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-900/80 backdrop-blur text-xs uppercase text-gray-400 font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4">Message Preview</th>
                    <th className="px-6 py-4">Threat Level</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {reports.map((report) => {
                     const isScam = report.scam_type && report.scam_type !== 'None';
                     const severityColor = report.confidence_score > 0.8 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30';
                     const safeColor = 'bg-green-500/10 text-green-400 border-green-500/20';
                     return (
                      <tr key={report.id} className="hover:bg-gray-700/30 transition-colors group">
                        <td className="px-6 py-4 text-gray-300">
                          <div className="max-w-[250px] truncate font-medium group-hover:text-white transition-colors">
                            {report.message_text}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isScam ? (
                            <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${severityColor}`}>
                              {report.scam_type}
                            </span>
                          ) : (
                            <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${safeColor}`}>
                              Safe
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-medium font-mono">
                          {new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Live Alerts Feed (Right, 1 col) */}
        <div className="lg:col-span-1 h-[500px]">
          <LiveAlertFeed userId={currentUser?.id} />
        </div>
      </div>
    </div>
  );
}
