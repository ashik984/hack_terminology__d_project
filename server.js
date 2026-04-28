const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Mock Chatbot API endpoint
app.post('/api/classify', (req, res) => {
  const text = req.body.text || '';
  // Basic mock response for the AI waste classification
  const reply = `Mock AI Analysis: You mentioned "${text}". If this is plastic or glass, please use the dry waste bin. For food scraps, use wet waste.`;
  res.json({ reply });
});

// Fallback to index.html for PWA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚛 EcoRoute server running at http://localhost:${port}`);
});
