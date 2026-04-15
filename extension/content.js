// ShieldAI Gmail Content Script

const KEYWORDS = ['otp', 'kyc', 'upi', 'lottery', 'prize', 'verify', 'urgent', 'winner', 'account suspended'];

function scanEmails() {
  // Select generic row classes present in modern Gmail DOM
  const emailRows = document.querySelectorAll('tr.zA');
  
  let scamFound = false;

  emailRows.forEach(row => {
    // Prevent double processing
    if (row.dataset.shieldScanned) return;
    
    // Attempt to locate subject line node
    const subjNode = row.querySelector('.bog span') || row.querySelector('span.bog');
    if (!subjNode) return;
    
    const subject = subjNode.textContent.toLowerCase();
    
    // Check linguistics
    const isSuspicious = KEYWORDS.some(kw => subject.includes(kw));
    
    if (isSuspicious) {
      row.style.borderLeft = '4px solid #ef4444';
      row.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
      
      // Inject visual banner inline
      const banner = document.createElement('div');
      banner.style.color = '#dc2626';
      banner.style.border = '1px solid #fca5a5';
      banner.style.backgroundColor = '#fef2f2';
      banner.style.fontSize = '10px';
      banner.style.fontWeight = 'bold';
      banner.style.padding = '2px 6px';
      banner.style.borderRadius = '4px';
      banner.style.display = 'inline-flex';
      banner.style.alignItems = 'center';
      banner.style.marginLeft = '10px';
      banner.innerHTML = '⚠️ ShieldAI: Suspicious';
      
      // Append to the Sender Name column if possible
      const senderCol = row.querySelector('.yX.xY') || row.querySelector('.yW');
      if (senderCol) {
         senderCol.appendChild(banner);
      }
      
      scamFound = true;
    }

    row.dataset.shieldScanned = 'true';
  });

  if (scamFound) {
    chrome.runtime.sendMessage({ type: 'SCAM_DETECTED' });
  }
}

// Observe dynamically loaded emails proactively rather than just static loads
setInterval(scanEmails, 3000);
