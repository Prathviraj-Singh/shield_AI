import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ResultBadge from '../components/ResultBadge';
import { useScamDetect } from '../hooks/useScamDetect';
import { useToast } from '../contexts/ToastContext';

const exampleMessages = [
  { label: "Bank OTP", text: "Dear customer, your SBI account has been suspended due to pending KYC. Click here to update PAN and share OTP sent to your phone. link: http://sbi-verify-kyc.com" },
  { label: "Job Scam", text: "You have been selected for a part-time job from YouTube! Like our videos and earn Rs 5000 daily. Send hi on whatsapp +91 9876543210 to start earning." },
  { label: "Safe Ping", text: "Hi Rohan, the team meeting is scheduled for 3 PM tomorrow on teams. Regards, HR Team." }
];

export default function ScanMessage() {
  const [message, setMessage] = useState('');
  const { detectMessage, result, loading, error } = useScamDetect();
  const { addToast } = useToast();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const data = await detectMessage(message);
    if (data) {
      const isScam = data.scam_type && data.scam_type !== 'None';
      if (isScam) {
        addToast("Scam Detected! Stay Safe", "scam");
        if (data.confidence_score > 0.8) {
          setTimeout(() => {
            addToast("Alert Sent Successfully", "info");
          }, 600);
        }
      } else {
        addToast("Message is Safe", "safe");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-3">Security Scanner</h1>
        <p className="text-lg text-gray-400">Paste any suspicious SMS, WhatsApp message, or Email below to analyze it for fraud.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Input Form Column */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleScan} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
            <div className="mb-6">
              <label className="flex justify-between text-sm font-medium text-gray-300 mb-3">
                <span>Message Content</span>
                <span className="text-gray-500">{message.length} chars</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="8"
                placeholder="Paste the exact suspicious message here..."
                className="w-full px-5 py-4 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 resize-none transition-all placeholder-gray-600 shadow-inner"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed flex justify-center items-center h-14"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Threat Patterns...
                </>
              ) : (
                'Scan Message'
              )}
            </button>
            {error && <div className="mt-4 px-4 py-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium">{error}</div>}
          </form>

          <div className="pt-2">
             <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Try Testing Examples</h3>
             <div className="flex flex-wrap gap-3">
               {exampleMessages.map((ex, idx) => (
                 <button
                   type="button"
                   key={idx}
                   onClick={() => setMessage(ex.text)}
                   className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 transition-colors shadow-sm"
                 >
                   {ex.label}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6">
              <ResultBadge result={result} />
              
              {/* Agent Actions Timeline */}
              {result.actions_taken && result.actions_taken.length > 0 && (
                <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/60 shadow-xl">
                  <h3 className="text-sm font-bold text-gray-300 mb-6 uppercase tracking-widest flex items-center">
                    <svg className="w-5 h-5 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Agent Actions
                  </h3>
                  <div className="relative pl-6 space-y-8 border-l-2 border-gray-700/50 ml-2">
                    {result.actions_taken.map((action, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15, duration: 0.4, ease: "easeOut" }}
                        key={idx}
                        className="relative"
                      >
                        <div className="absolute -left-[35px] top-1 rounded-full bg-green-500/20 p-1 border border-green-500/50 shadow-sm shadow-green-500/20">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2">
                           Step {idx + 1} — <span className="text-blue-400">{action.tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </h4>
                        <p className="text-sm text-gray-400 leading-relaxed bg-gray-900/50 p-4 rounded-xl border border-gray-800 shadow-inner">
                           {action.observation}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-500 bg-gray-800/30 p-8 text-center transition-all bg-[length:20px_20px] bg-grid-gray-800/[0.2]">
              <div className="p-4 bg-gray-800/50 rounded-full mb-6">
                 <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
              </div>
              <h3 className="font-bold text-xl text-gray-300 mb-2">Awaiting Target</h3>
              <p className="text-sm text-gray-500 max-w-[250px] mx-auto leading-relaxed">
                Run a scan to see the detailed AI threat extraction, confidence score, and actionable safety guidance here.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
