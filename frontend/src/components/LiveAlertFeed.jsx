import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AlertCard from './AlertCard';

export default function LiveAlertFeed({ userId }) {
  const [alerts, setAlerts] = useState([]);
  
  useEffect(() => {
    if (!userId) return;

    // Load initial 5 alerts
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) setAlerts(data);
    };
    
    fetchAlerts();

    // Setup Supabase Realtime Subscription
    const subscription = supabase
      .channel('public:alerts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'alerts',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setAlerts(prev => [payload.new, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 backdrop-blur rounded-2xl p-6 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-700/50">
        <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            <h3 className="font-bold text-lg text-white">System Alerts</h3>
        </div>
        <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-lg shadow-green-500/50"></span>
          </span>
          <span className="text-[10px] font-bold text-green-400 tracking-widest uppercase">Live Feed</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3 opacity-60">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
             <span className="text-sm font-medium">No recent alerts</span>
          </div>
        ) : (
          alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
}
