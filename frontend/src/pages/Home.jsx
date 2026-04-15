import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-50"></div>
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 rounded-full"></div>
          <svg className="w-32 h-32 text-blue-500 relative z-10 drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500"
        >
          Protect Yourself from <br className="hidden md:block"/> Cyber Fraud
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-10 font-light"
        >
          Your intelligent, AI-powered cyber safety agent designed beautifully to detect Indian-specific scams like UPI fraud, fake OTPs, and phishing links in real-time.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/scan" className="bg-blue-600 hover:bg-blue-500 font-bold py-4 px-8 rounded-full text-white shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1">
            Scan a Message
          </Link>
          <Link to="/dashboard" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 font-bold py-4 px-8 rounded-full text-white transition-all transform hover:-translate-y-1">
            View Dashboard
          </Link>
        </motion.div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-gray-800/30 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Enterprise-Grade Protection</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Sophisticated analysis running locally to keep your private data safe.</p>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeInUp} className="bg-gray-800/60 p-8 rounded-2xl border border-gray-700/50 hover:bg-gray-700/50 transition-colors group">
              <div className="bg-blue-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Fraud Detection</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Built specifically to analyze local threats including UPI collect requests, fake delivery OTPs, and bank KYC phishing.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeInUp} className="bg-gray-800/60 p-8 rounded-2xl border border-gray-700/50 hover:bg-gray-700/50 transition-colors group">
              <div className="bg-green-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Alerts</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Opt internally to receive instant SMS and email notifications whenever a high-confidence threat crosses your radar.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeInUp} className="bg-gray-800/60 p-8 rounded-2xl border border-gray-700/50 hover:bg-gray-700/50 transition-colors group">
              <div className="bg-purple-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Scam Classifier</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Not just a binary safe/unsafe. ShieldAI categorizes the exact vector (e.g. 'Sextortion', 'Crypto', 'Job Offer') to give you actionable guidance.</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={fadeInUp} className="bg-gray-800/60 p-8 rounded-2xl border border-gray-700/50 hover:bg-gray-700/50 transition-colors group">
              <div className="bg-orange-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Agentic AI Workflows</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Built on a native ReAct loop, our system autonomously calls local keywords, triggers API evaluations, and dispatches Twilio alerts automatically.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How ShieldAI Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Three simple steps to secure your digital communications.</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-800 via-blue-900 to-gray-800 -translate-y-1/2 z-0"></div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10"
          >
            {/* Step 1 */}
            <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-700/80 p-8 rounded-2xl text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">1</div>
              <h3 className="text-xl font-bold text-white mb-2">Paste Message</h3>
              <p className="text-gray-400 text-sm">Copy any suspicious SMS, WhatsApp forward, or Email into our scanner block.</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-700/80 p-8 rounded-2xl text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/30">2</div>
              <h3 className="text-xl font-bold text-white mb-2">AI Analyzes</h3>
              <p className="text-gray-400 text-sm">Our Gemini-powered engine checks the linguistics, links, and intent against known threat vectors.</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-700/80 p-8 rounded-2xl text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-600/30">3</div>
              <h3 className="text-xl font-bold text-white mb-2">Get Results</h3>
              <p className="text-gray-400 text-sm">Instantly receive a risk score, category, and actionable advice securely on your dashboard.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-20 bg-blue-900/10 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-700">
             <div className="py-4">
                <div className="text-5xl font-black text-white mb-2">5+</div>
                <div className="text-blue-400 font-semibold tracking-wide uppercase text-sm">Targeted Scam Types</div>
             </div>
             <div className="py-4">
                <div className="text-5xl font-black text-white mb-2">50+</div>
                <div className="text-blue-400 font-semibold tracking-wide uppercase text-sm">Indian Threat Patterns</div>
             </div>
             <div className="py-4">
                <div className="text-5xl font-black text-white mb-2">24/7</div>
                <div className="text-blue-400 font-semibold tracking-wide uppercase text-sm">Real-time Protection</div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-950 py-12 border-t border-gray-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center space-x-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-500 mb-4 opacity-50">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span>ShieldAI</span>
          </div>
          <p className="text-gray-600 text-sm text-center max-w-md mb-6">
            Building a safer internet for India through advanced artificial intelligence and proactive threat detection.
          </p>
          <div className="flex space-x-6">
             <a href="#" className="text-gray-500 hover:text-white transition-colors">
               <span className="sr-only">GitHub</span>
               <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                 <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
               </svg>
             </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
