document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('checkBtn');
  const msgInput = document.getElementById('message');
  const resultBox = document.getElementById('result');
  const resType = document.getElementById('resType');
  const resText = document.getElementById('resText');
  const resGuidance = document.getElementById('resGuidance');

  btn.addEventListener('click', async () => {
    const text = msgInput.value.trim();
    if (!text) return;

    btn.disabled = true;
    btn.textContent = 'Analyzing Threat...';
    resultBox.style.display = 'none';

    try {
      // Calls local FastAPI backend correctly mapped to detect endpoint
      const response = await fetch('http://localhost:8000/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text, user_id: 'extension_user' })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      resultBox.style.display = 'block';
      
      const isScam = data.scam_type && data.scam_type !== 'None';
      resultBox.className = isScam ? 'scam' : 'safe';
      
      resType.textContent = isScam ? data.scam_type : 'VERIFIED SAFE';
      resText.textContent = isScam ? `Threat detected (${Math.round(data.confidence * 100)}% Confidence)` : 'No AI threat detected.';
      resGuidance.textContent = data.guidance || (isScam ? 'Avoid clicking any links.' : 'Proceed with normal caution.');
      
    } catch (err) {
      resultBox.style.display = 'block';
      resultBox.className = 'scam';
      resType.textContent = 'CONNECTION ERROR';
      resText.textContent = 'Could not reach ShieldAI Server.';
      resGuidance.textContent = 'Is your backend running on localhost:8000? Exception: ' + err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Check Now';
    }
  });
});
