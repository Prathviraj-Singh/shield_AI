import React from 'react';
import { motion } from 'framer-motion';

export default function AlertCard({ alert }) {
  const getStyles = (type) => {
    switch (type?.toLowerCase()) {
      case 'critical':
        return { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' };
      case 'warning':
        return { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' };
      default:
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
    }
  };

  const style = getStyles(alert.alert_type);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3.5 rounded-lg border ${style.bg} ${style.border} mb-3 shadow-md backdrop-blur-sm relative overflow-hidden group`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg.replace('/10','')} opacity-50`}></div>
      <div className="flex items-start space-x-3 pl-2">
        <div className={`p-1.5 rounded-full ${style.bg.replace('/10', '/20')} mt-0.5`}>
            <svg className={`w-4 h-4 flex-shrink-0 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={style.icon} />
            </svg>
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-sm font-medium text-gray-200 leading-snug">{alert.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${style.bg} ${style.text} border ${style.border}`}>
              {alert.alert_type || 'INFO'}
            </span>
            <span className="text-xs font-mono text-gray-500">
              {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
