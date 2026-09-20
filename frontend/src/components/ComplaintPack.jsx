import React, { useState, useEffect, useMemo } from 'react';
import {
  SECTIONS,
  BY_CATEGORY,
  ADDONS,
  getApplicableSections,
  LEGAL_DISCLAIMER,
  BSA_EVIDENCE_NOTE,
} from '../data/legalMap';

/**
 * Helper to extract phone numbers, UPI handles, or URLs from message text
 */
function extractScammerInfo(text) {
  if (!text) return '';
  const urlMatch = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/i);
  const upiMatch = text.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/);
  const phoneMatch = text.match(/(\+?\d[\d\s\-]{8,}\d)/);
  const parts = [];
  if (phoneMatch) parts.push(phoneMatch[0].trim());
  if (upiMatch) parts.push(upiMatch[0].trim());
  if (urlMatch) parts.push(urlMatch[0].trim());
  return parts.join(' | ');
}

/**
 * Map detected scan type or message to one of the exact category keys
 */
function normalizeCategory(scamType, message) {
  const combined = `${scamType || ''} ${message || ''}`.toLowerCase();
  if (combined.includes('sextortion') || combined.includes('nude') || combined.includes('private video')) return 'Sextortion';
  if (combined.includes('kyc') || combined.includes('pan')) return 'KYC';
  if (combined.includes('otp')) return 'Fake OTP';
  if (combined.includes('job') || combined.includes('part-time') || combined.includes('youtube')) return 'Job offer';
  if (combined.includes('delivery') || combined.includes('package') || combined.includes('amazon') || combined.includes('courier')) return 'Delivery';
  if (combined.includes('crypto') || combined.includes('bitcoin') || combined.includes('usdt')) return 'Crypto';
  if (combined.includes('upi') || combined.includes('qr') || combined.includes('refund')) return 'UPI fraud';
  if (combined.includes('phish') || combined.includes('link') || combined.includes('bank')) return 'Phishing';
  return 'UPI fraud';
}

export default function ComplaintPack({ isOpen, onClose, scanResult, scannedMessage }) {
  // Form State
  const [incidentDateTime, setIncidentDateTime] = useState(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [scamCategory, setScamCategory] = useState('UPI fraud');
  const [messageText, setMessageText] = useState('');
  const [scammerIdentifier, setScammerIdentifier] = useState('');
  const [amountLost, setAmountLost] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [victimName, setVictimName] = useState('');
  const [victimPhone, setVictimPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [sha256Hash, setSha256Hash] = useState('computing...');
  const [hashUtcTime, setHashUtcTime] = useState('');

  // Addon Checkboxes State
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Toggle addon checkbox
  const toggleAddon = (addonKey) => {
    setSelectedAddons((prev) =>
      prev.includes(addonKey) ? prev.filter((k) => k !== addonKey) : [...prev, addonKey]
    );
  };

  // Prefill when opened with scan details
  useEffect(() => {
    if (isOpen) {
      const category = normalizeCategory(scanResult?.scam_type, scannedMessage);
      setScamCategory(category);
      setMessageText(scannedMessage || '');
      setScammerIdentifier(extractScammerInfo(scannedMessage || ''));
      setHashUtcTime(new Date().toISOString());

      // Auto-check relevant addons based on text heuristics
      const initialAddons = [];
      const lower = (scannedMessage || '').toLowerCase();
      if (lower.includes('bank') || lower.includes('sbi') || lower.includes('hdfc') || lower.includes('icici') || lower.includes('amazon') || lower.includes('youtube')) {
        initialAddons.push('posed_as_bank_or_company');
      }
      if (lower.includes('police') || lower.includes('cbi') || lower.includes('customs') || lower.includes('officer')) {
        initialAddons.push('posed_as_govt_officer');
      }
      if (lower.includes('otp') || lower.includes('password') || lower.includes('pin') || lower.includes('kyc')) {
        initialAddons.push('otp_or_id_misused');
      }
      if (lower.includes('http') || lower.includes('www.') || lower.includes('.com') || lower.includes('.co.in')) {
        initialAddons.push('fake_website_or_document');
      }
      setSelectedAddons(initialAddons);
    }
  }, [isOpen, scanResult, scannedMessage]);

  // Compute SHA-256 hash of evidence
  useEffect(() => {
    let isCurrent = true;
    async function calcHash() {
      if (!window.crypto || !window.crypto.subtle) {
        if (isCurrent) setSha256Hash('SHA-256 unavailable (requires secure context)');
        return;
      }
      try {
        const textToHash = messageText || scannedMessage || '';
        const enc = new TextEncoder();
        const buf = await window.crypto.subtle.digest('SHA-256', enc.encode(textToHash));
        const hash = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        if (isCurrent) {
          setSha256Hash(hash);
        }
      } catch {
        if (isCurrent) setSha256Hash('computation error');
      }
    }
    calcHash();
    return () => {
      isCurrent = false;
    };
  }, [messageText, scannedMessage]);

  // Calculate applicable sections deterministically: union of category + addons, deduped
  const applicableSections = useMemo(() => {
    return getApplicableSections(scamCategory, selectedAddons);
  }, [scamCategory, selectedAddons]);

  // Plain text complaint summary for copy
  const plainTextSummary = useMemo(() => {
    const sectionsText = applicableSections
      .map((s) => `  - ${s.act} Section ${s.section}: ${s.title} [Old IPC Ref: ${s.oldRef}]`)
      .join('\n');

    return [
      '================================================================',
      '        CYBER CELL COMPLAINT PACK & INCIDENT DOSSIER',
      '   Prepared via ShieldAI (National Cyber Crime Assistance Pack)',
      '================================================================',
      '',
      `Date & Time of Incident : ${incidentDateTime || 'Not specified'}`,
      `Scam Classification     : ${scamCategory || 'Cyber Fraud'}`,
      '',
      '--- VICTIM DETAILS ---',
      `Name                    : ${victimName.trim() || 'Not provided'}`,
      `Contact Phone Number    : ${victimPhone.trim() || 'Not provided'}`,
      '',
      '--- SUSPECT / SCAMMER IDENTIFIERS ---',
      `Suspect Phone / UPI / URL: ${scammerIdentifier.trim() || 'None detected in text'}`,
      '',
      '--- FINANCIAL LOSS DETAILS ---',
      `Amount Lost (INR)       : ${amountLost ? 'Rs. ' + amountLost : 'Nil / None reported'}`,
      `Transaction / UTR ID    : ${transactionId.trim() || 'N/A'}`,
      '',
      '--- SUSPICIOUS EVIDENCE TEXT (EXACT VERBATIM) ---',
      `"${messageText.trim()}"`,
      '',
      '--- DIGITAL EVIDENCE INTEGRITY ---',
      `Evidence SHA-256 Digest : ${sha256Hash}`,
      `Recorded UTC Timestamp  : ${hashUtcTime}`,
      `Evidence Certificate   : ${BSA_EVIDENCE_NOTE}`,
      '',
      '--- APPLICABLE LEGAL SECTIONS (INDICATIVE: BNS 2023 & IT ACT 2000) ---',
      sectionsText || '  - None mapped',
      `Note: ${LEGAL_DISCLAIMER}`,
      '',
      '--- IMMEDIATE ACTION FOR VICTIMS ---',
      '1. Call 1930 immediately to report financial fraud and place bank lien.',
      '2. File formal complaint on https://cybercrime.gov.in',
      '3. Submit this summary and transaction proof at your local Cyber Crime Cell.',
      '',
      'NOTE: This pack helps you file. ShieldAI does not submit it for you.',
      '================================================================',
    ].join('\n');
  }, [
    incidentDateTime,
    scamCategory,
    victimName,
    victimPhone,
    scammerIdentifier,
    amountLost,
    transactionId,
    messageText,
    sha256Hash,
    hashUtcTime,
    applicableSections,
  ]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(plainTextSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const payload = {
      title: 'ShieldAI Cyber Cell Complaint Pack',
      generated_utc: hashUtcTime,
      incident: {
        dateTime: incidentDateTime,
        category: scamCategory,
        message: messageText,
        scammer: scammerIdentifier,
        amountLost: amountLost || null,
        transactionId: transactionId || null,
      },
      victim: {
        name: victimName || null,
        phone: victimPhone || null,
      },
      evidenceIntegrity: {
        algorithm: 'SHA-256',
        hash: sha256Hash,
        verifiedAt: hashUtcTime,
        bsa_note: BSA_EVIDENCE_NOTE,
      },
      applicable_sections: applicableSections.map((s) => ({
        act: s.act,
        section: s.section,
        title: s.title,
        old_ipc_ref: s.oldRef,
      })),
      legal_disclaimer: LEGAL_DISCLAIMER,
      helpline: '1930',
      officialPortal: 'https://cybercrime.gov.in',
      disclaimer: 'This pack helps you file. ShieldAI does not submit it for you.',
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybercell_complaint_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Stretch goal: Export for Trace CSV
  const handleExportTrace = () => {
    const headers = 'txn_id,timestamp,from_upi,from_mobile,to_upi,to_mobile,amount,channel';
    const txn = transactionId ? transactionId.replace(/,/g, '') : `TXN${Date.now()}`;
    const ts = incidentDateTime ? new Date(incidentDateTime).toISOString() : new Date().toISOString();
    const fromMobile = (victimPhone || '').replace(/[^\d+]/g, '');

    let toUpi = '';
    let toMobile = '';
    if (scammerIdentifier) {
      const upiMatch = scammerIdentifier.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/);
      const phoneMatch = scammerIdentifier.match(/\+?\d[\d\s\-]{8,}\d/);
      if (upiMatch) toUpi = upiMatch[0];
      if (phoneMatch) toMobile = phoneMatch[0].replace(/[^\d+]/g, '');
      if (!toUpi && !toMobile) {
        toUpi = scammerIdentifier.replace(/,/g, ' ');
      }
    }

    const amt = (amountLost || '0').replace(/[^\d.]/g, '');
    const channel = toUpi ? 'UPI' : 'NET_BANKING';

    const row = [
      `"${txn}"`,
      `"${ts}"`,
      '""',
      `"${fromMobile}"`,
      `"${toUpi}"`,
      `"${toMobile}"`,
      amt || '0',
      `"${channel}"`,
    ].join(',');

    const blob = new Blob([`${headers}\n${row}\n`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace_bank_evidence_${txn}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Embedded Print CSS for Clean 1-Page Layout */}
      <style>{`
        @media print {
          @page {
            margin: 8mm 10mm;
            size: A4 portrait;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #cybercell-print-pack, #cybercell-print-pack * {
            visibility: visible !important;
          }
          #cybercell-print-pack {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 10px 14px !important;
            background: #ffffff !important;
            color: #111827 !important;
            display: block !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
            font-size: 8.5pt !important;
            line-height: 1.35 !important;
            z-index: 9999999 !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Screen Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
        <div className="bg-gray-900 border border-gray-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
          {/* Modal Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Cyber Cell Complaint Pack
                  <span className="text-xs bg-red-600/80 text-white font-semibold px-2 py-0.5 rounded-full">Citizen Assistance</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Prepares an official evidence dossier to file on cybercrime.gov.in or report to 1930.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body: 2 Columns */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Incident Information
                </h3>
                <span className="text-xs text-gray-500">All fields are optional</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Incident Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={incidentDateTime}
                    onChange={(e) => setIncidentDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Scam Category</label>
                  <select
                    value={scamCategory}
                    onChange={(e) => setScamCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.keys(BY_CATEGORY).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Scammer Phone / UPI ID / Website URL
                </label>
                <input
                  type="text"
                  value={scammerIdentifier}
                  onChange={(e) => setScammerIdentifier(e.target.value)}
                  placeholder="e.g. +91 9876543210 or fraud@upi"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Amount Lost (Rs.)</label>
                  <input
                    type="text"
                    value={amountLost}
                    onChange={(e) => setAmountLost(e.target.value)}
                    placeholder="e.g. 25000 (if money lost)"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Transaction / UTR ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. UPI Ref / Bank UTR"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Victim Name</label>
                  <input
                    type="text"
                    value={victimName}
                    onChange={(e) => setVictimName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Victim Phone</label>
                  <input
                    type="tel"
                    value={victimPhone}
                    onChange={(e) => setVictimPhone(e.target.value)}
                    placeholder="Your registered phone"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Suspicious Message Content (Verbatim Evidence)
                </label>
                <textarea
                  rows="3"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Exact text of the scam message..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-sans"
                />
              </div>

              {/* SHA-256 Integrity Card & BSA Note */}
              <div className="p-3 bg-gray-800/80 border border-gray-700 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    SHA-256 Digital Fingerprint
                  </span>
                  <span className="font-mono text-[11px] text-gray-500">crypto.subtle</span>
                </div>
                <div className="font-mono text-[11px] text-gray-300 break-all bg-gray-900/90 p-2 rounded border border-gray-700/60 select-all">
                  {sha256Hash}
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Timestamp: {hashUtcTime || 'recording...'}</span>
                </div>
                <p className="text-[11px] text-emerald-400/90 font-medium pt-1 border-t border-gray-700/50">
                  {BSA_EVIDENCE_NOTE}
                </p>
              </div>
            </div>

            {/* Right Column: Addons, Legal Sections & Output */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              {/* Incident Addon Checkboxes (Auto-maps Legal Sections) */}
              <div className="p-3.5 bg-gray-800/80 border border-gray-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Incident Factors (Select to add sections)
                  </h4>
                  <span className="text-[11px] text-gray-500">Auto-maps BNS/IT Act</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(ADDONS).map(([key, item]) => {
                    const isChecked = selectedAddons.includes(key);
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-2 p-2 rounded-lg border transition cursor-pointer select-none ${
                          isChecked
                            ? 'bg-blue-950/50 border-blue-500/70 text-blue-200'
                            : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(key)}
                          className="mt-0.5 rounded border-gray-700 text-blue-600 focus:ring-0"
                        />
                        <span className="leading-snug">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Applicable Sections Table (Indicative) */}
              <div className="p-3.5 bg-gray-800/80 border border-gray-700 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Applicable Legal Sections (Indicative)
                  </h4>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    BNS 2023 &amp; IT Act 2000
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 italic">
                  {LEGAL_DISCLAIMER}
                </p>

                <div className="overflow-x-auto max-h-[170px] overflow-y-auto border border-gray-700/60 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                      <tr className="border-b border-gray-700 text-gray-400 font-semibold">
                        <th className="py-1.5 px-2.5">Act</th>
                        <th className="py-1.5 px-2.5">Section</th>
                        <th className="py-1.5 px-2.5">What it means</th>
                        <th className="py-1.5 px-2.5 whitespace-nowrap">Old IPC Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 font-sans text-gray-300">
                      {applicableSections.length > 0 ? (
                        applicableSections.map((sec) => (
                          <tr key={sec.id} className="hover:bg-gray-700/30">
                            <td className="py-1.5 px-2.5 font-bold text-blue-400 whitespace-nowrap">{sec.act}</td>
                            <td className="py-1.5 px-2.5 font-mono font-semibold text-white whitespace-nowrap">{sec.section}</td>
                            <td className="py-1.5 px-2.5 text-gray-300">{sec.title}</td>
                            <td className="py-1.5 px-2.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">{sec.oldRef}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-2 px-2.5 text-center text-gray-500">
                            No sections mapped for current selection.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Generated Text Header & Copy Button */}
              <div className="flex items-center justify-between pb-1 border-b border-gray-800">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Generated Complaint Summary
                </h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-blue-400 text-xs font-semibold rounded-md border border-gray-700 transition flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Plain Text
                    </>
                  )}
                </button>
              </div>

              {/* Textarea Preview */}
              <div className="flex-1 min-h-[140px]">
                <textarea
                  readOnly
                  value={plainTextSummary}
                  className="w-full h-full min-h-[140px] p-3 bg-gray-950 border border-gray-800 rounded-xl text-[11px] font-mono text-gray-300 focus:outline-none resize-none leading-relaxed select-all"
                />
              </div>

              {/* Urgent Citizen Helplines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href="tel:1930"
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl text-center shadow-lg shadow-red-600/25 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call 1930 Helpline
                </a>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl text-center shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  File on cybercrime.gov.in ↗
                </a>
              </div>

              {/* Downloads Bar */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF (Print)
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download JSON
                </button>

                <button
                  type="button"
                  onClick={handleExportTrace}
                  title="Export 1-row CSV for ShieldAI Trace forensic analyzer"
                  className="flex-1 min-w-[120px] px-3 py-2 bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-200 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Export for Trace (CSV)
                </button>
              </div>

              {/* Legal / Non-submission advisory */}
              <div className="p-2.5 bg-gray-800/40 border border-gray-700/50 rounded-xl text-center">
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">Notice:</span> This pack helps you file. ShieldAI does not submit it for you.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 bg-gray-800/50 border-t border-gray-700/70 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-semibold rounded-lg transition border border-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Container for Print via window.print() (Clean 1-Page Layout) */}
      <div id="cybercell-print-pack" style={{ display: 'none' }}>
        <div style={{ borderBottom: '2px solid #111827', paddingBottom: '6px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: '0 0 2px', fontSize: '13pt', fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' }}>
                Cyber Crime Incident &amp; Evidence Dossier
              </h1>
              <p style={{ margin: 0, fontSize: '8pt', color: '#4B5563' }}>
                Prepared for submission to <strong>National Cyber Crime Reporting Portal (cybercrime.gov.in)</strong> &amp; Cyber Police Cells
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '8pt', color: '#374151' }}>
              <div><strong>Emergency Helpline:</strong> 1930</div>
              <div><strong>Date:</strong> {incidentDateTime ? incidentDateTime.replace('T', ' ') : new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Overview Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '8pt' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '4px 6px', fontWeight: 'bold', width: '22%', background: '#F3F4F6' }}>Incident Category</td>
              <td style={{ padding: '4px 6px', width: '28%' }}>{scamCategory || 'Cyber Fraud'}</td>
              <td style={{ padding: '4px 6px', fontWeight: 'bold', width: '22%', background: '#F3F4F6' }}>Incident Date/Time</td>
              <td style={{ padding: '4px 6px', width: '28%' }}>{incidentDateTime ? incidentDateTime.replace('T', ' ') : 'Unspecified'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#F3F4F6' }}>Complainant Name</td>
              <td style={{ padding: '4px 6px' }}>{victimName || 'Not specified'}</td>
              <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#F3F4F6' }}>Complainant Phone</td>
              <td style={{ padding: '4px 6px' }}>{victimPhone || 'Not specified'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#F3F4F6' }}>Suspect Identifiers</td>
              <td style={{ padding: '4px 6px' }}>{scammerIdentifier || 'See message content'}</td>
              <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#F3F4F6' }}>Financial Loss</td>
              <td style={{ padding: '4px 6px', fontWeight: 'bold', color: amountLost ? '#DC2626' : '#111827' }}>
                {amountLost ? `Rs. ${amountLost}` : 'Nil / None reported'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#F3F4F6' }}>Transaction / UTR ID</td>
              <td colSpan="3" style={{ padding: '4px 6px', fontFamily: 'monospace' }}>
                {transactionId || 'None'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Evidence Box */}
        <div style={{ marginBottom: '8px' }}>
          <h3 style={{ margin: '0 0 3px', fontSize: '8.5pt', textTransform: 'uppercase', color: '#1F2937', fontWeight: 'bold' }}>
            Primary Evidence Message (Exact Verbatim Capture)
          </h3>
          <div
            style={{
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              padding: '6px 8px',
              background: '#F9FAFB',
              fontFamily: 'monospace',
              fontSize: '8pt',
              lineHeight: '1.3',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {messageText || '(No message text provided)'}
          </div>
        </div>

        {/* Applicable Legal Sections (Indicative) */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
            <h3 style={{ margin: 0, fontSize: '8.5pt', textTransform: 'uppercase', color: '#111827', fontWeight: 'bold' }}>
              Applicable Legal Sections (Indicative &bull; BNS 2023 &amp; IT Act 2000)
            </h3>
          </div>
          <p style={{ margin: '0 0 3px', fontSize: '7.5pt', color: '#6B7280', fontStyle: 'italic' }}>
            {LEGAL_DISCLAIMER}
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', border: '1px solid #D1D5DB' }}>
            <thead>
              <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #D1D5DB', textAlign: 'left' }}>
                <th style={{ padding: '3px 6px', width: '12%' }}>Act</th>
                <th style={{ padding: '3px 6px', width: '14%' }}>Section</th>
                <th style={{ padding: '3px 6px' }}>What it means</th>
                <th style={{ padding: '3px 6px', width: '16%' }}>Old IPC Ref</th>
              </tr>
            </thead>
            <tbody>
              {applicableSections.map((sec) => (
                <tr key={sec.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '2px 6px', fontWeight: 'bold' }}>{sec.act}</td>
                  <td style={{ padding: '2px 6px', fontFamily: 'monospace' }}>{sec.section}</td>
                  <td style={{ padding: '2px 6px' }}>{sec.title}</td>
                  <td style={{ padding: '2px 6px', color: '#4B5563', fontFamily: 'monospace' }}>{sec.oldRef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cryptographic Verification */}
        <div
          style={{
            border: '1px solid #059669',
            borderRadius: '4px',
            padding: '5px 8px',
            background: '#ECFDF5',
            marginBottom: '8px',
            fontSize: '7.5pt',
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#065F46', marginBottom: '1px' }}>
            DIGITAL EVIDENCE VERIFICATION (SHA-256 HASH)
          </div>
          <div style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#047857' }}>
            {sha256Hash}
          </div>
          <div style={{ color: '#065F46', marginTop: '1px' }}>
            Generated UTC: {hashUtcTime} &bull; Client-side verifiable integrity hash
          </div>
          <div style={{ color: '#047857', marginTop: '2px', fontWeight: 'bold' }}>
            {BSA_EVIDENCE_NOTE}
          </div>
        </div>

        {/* Action Guidelines */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '6px', fontSize: '7.5pt', color: '#374151' }}>
          <strong>Next Immediate Legal Steps:</strong>
          <ol style={{ margin: '2px 0 4px', paddingLeft: '16px' }}>
            <li>Call <strong>1930</strong> immediately to request transaction lien / freeze on destination accounts.</li>
            <li>Submit this document on <strong>https://cybercrime.gov.in</strong> under "Report Cyber Crime".</li>
            <li>Retain original SMS/WhatsApp chat screenshots and official bank account statement.</li>
          </ol>
          <div style={{ fontSize: '7pt', color: '#6B7280', fontStyle: 'italic' }}>
            Disclaimer: This pack helps you file. ShieldAI does not submit it for you. Prepared as evidence collation tool.
          </div>
        </div>
      </div>
    </>
  );
}
