chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCAM_DETECTED') {
    chrome.notifications.create({
      type: 'basic',
      // Inline 1x1 transparent Base64 PNG fallback since no local icon exists yet
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAFElEQVR42mNkYPhfzzAEYxgYAAAA//8BAQwA1r21/QAAAABJRU5ErkJggg==',
      title: '⚠️ ShieldAI Warning',
      message: 'Suspicious email detected in your Gmail matching active Indian scam patterns.',
      priority: 2
    });
  }
});
