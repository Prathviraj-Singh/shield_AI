import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getStyle = (type) => {
    if (type === 'scam' || type === 'error') return 'bg-red-500/90 border border-red-400 text-white shadow-red-500/30';
    if (type === 'safe' || type === 'success') return 'bg-green-500/90 border border-green-400 text-white shadow-green-500/30';
    return 'bg-blue-600/90 border border-blue-400 text-white shadow-blue-500/30';
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 100, transition: { duration: 0.2 } }}
              className={`px-5 py-3 rounded-lg shadow-2xl font-medium pointer-events-auto flex items-center justify-between backdrop-blur-md ${getStyle(toast.type)}`}
              style={{ minWidth: '280px' }}
            >
              <span className="text-sm tracking-wide">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-70 hover:opacity-100 transition-opacity focus:outline-none flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
