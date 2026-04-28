document.addEventListener('DOMContentLoaded', () => {
  // Initialize map
  initMap();

  // Role Switching Logic
  const roleSelect = document.getElementById('role-select');
  const overlays = {
    home: document.getElementById('home-overlay'),
    point: document.getElementById('point-overlay'),
    driver: document.getElementById('driver-overlay')
  };

  roleSelect.addEventListener('change', (e) => {
    const role = e.target.value;
    
    // Hide all overlays
    Object.values(overlays).forEach(el => el.classList.remove('active'));
    
    // Show selected overlay
    if (overlays[role]) {
      overlays[role].classList.add('active');
    }
  });

  // Driver Route Button
  const startRouteBtn = document.getElementById('start-route-btn');
  startRouteBtn.addEventListener('click', () => {
    startRouteBtn.classList.remove('pulse');
    startRouteBtn.innerText = 'Calculating Route...';
    startRouteBtn.disabled = true;
    
    startCollectionRoute().then(() => {
      startRouteBtn.innerText = 'Route Active';
    });
  });

  // Chatbot Logic
  const fab = document.getElementById('chatbot-fab');
  const modal = document.getElementById('chatbot-modal');
  const closeBtn = document.getElementById('close-chat-btn');
  const sendBtn = document.getElementById('send-chat-btn');
  const chatInput = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');

  fab.addEventListener('click', () => {
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  async function sendChatMessage() {
    const val = chatInput.value.trim();
    if (!val) return;

    appendChatMsg(val, 'user');
    chatInput.value = '';

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: val })
      });
      const data = await response.json();
      appendChatMsg(data.reply, 'bot');
    } catch (err) {
      appendChatMsg('Error communicating with AI.', 'bot');
    }
  }

  function appendChatMsg(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.innerHTML = `<p>${text}</p>`;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  sendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });
});
