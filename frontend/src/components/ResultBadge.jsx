import React from 'react';
import { motion } from 'framer-motion';

export default function ResultBadge({ result }) {
  if (!result) return null;

  const isScam = result.is_scam;
  const confidence = Math.round(result.confidence * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`p-6 rounded-xl border shadow-2xl ${
        isScam 
          ? 'bg-red-900/10 border-red-500/50 text-red-100 shadow-red-900/20' 
          : 'bg-green-900/10 border-green-500/50 text-green-100 shadow-green-900/20'
      }`}
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className={`p-4 rounded-full ${isScam ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
          {isScam ? (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {isScam ? 'Danger: Scam Detected' : 'Safe Message'}
          </h2>
          {isScam && result.scam_type && result.scam_type !== 'None' && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block mt-2 px-3 py-1 bg-red-500/80 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-sm"
            >
              {result.scam_type}
            </motion.span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-gray-300">AI Confidence Score</span>
          <span className={isScam ? 'text-red-400' : 'text-green-400'}>{confidence}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className={`h-3 rounded-full ${
              isScam 
                ? 'bg-gradient-to-r from-red-600 to-red-400' 
                : 'bg-gradient-to-r from-green-600 to-green-400'
            }`}
          ></motion.div>
        </div>
      </div>

      <div className={`p-5 rounded-lg border ${
        isScam 
          ? 'bg-red-950/40 border-red-500/20 text-red-200' 
          : 'bg-green-950/40 border-green-500/20 text-green-200'
      }`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isScam ? 'text-red-400' : 'text-green-400'}`}>Guidance</h4>
        <p className="font-medium text-sm leading-relaxed">{result.guidance}</p>
      </div>
    </motion.div>
  );
}
