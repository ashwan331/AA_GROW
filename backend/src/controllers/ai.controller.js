// src/controllers/ai.controller.js
const { query } = require('../config/db');

/* ─── Gemini setup ────────────────────────────────────── */
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch {
    console.warn('Gemini SDK not installed.');
  }
}

const MOCK_RESPONSES = [
  'Great question! In agriculture, soil pH between 6.0–7.0 is ideal for most crops. Use lime to raise pH and sulfur to lower it.',
  'For pest management, consider Integrated Pest Management (IPM): use natural predators, crop rotation, and targeted pesticides only when necessary.',
  'Drip irrigation is 90% efficient vs. 60–70% for flood irrigation. It conserves water and delivers nutrients directly to roots.',
  'Nitrogen (N), Phosphorus (P), and Potassium (K) are the three primary macronutrients. N promotes leaf growth, P encourages root and flower development, K improves overall plant health.',
  'Crop rotation helps break pest and disease cycles, improves soil health, and can increase yields by 10–25% over monoculture.',
  'The best time to water crops is early morning – this reduces evaporation and allows foliage to dry before evening, reducing fungal risk.',
];

/* ─── CHAT ────────────────────────────────────────────── */
exports.chat = async (req, res) => {
  const { message, language = 'en' } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required.' });

  try {
    let response;

    if (genAI) {
      const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are AA_GROW, a helpful AI agriculture assistant. The farmer writes in language code '${language}'. Respond helpfully and concisely in the same language. Farmer says: ${message}`;
      const result = await model.generateContent(prompt);
      response     = result.response.text();
    } else {
      response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      response = `[AA_GROW AI] ${response}`;
    }

    // Log to DB
    await query(
      'INSERT INTO chat_history (user_id, message, response, language) VALUES (?, ?, ?, ?)',
      [req.user.id, message, response, language]
    );

    res.json({ response });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
};

/* ─── GET CHAT HISTORY ────────────────────────────────── */
exports.getChatHistory = async (req, res) => {
  const userId = req.user.id;
  const limit  = parseInt(req.query.limit) || 50;

  try {
    const [rows] = await query(
      'SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    res.json({ history: rows.reverse() });
  } catch (err) {
    console.error('Get chat history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── NOTIFICATIONS ───────────────────────────────────── */
exports.getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    res.json({ notifications: rows });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markNotificationRead = async (req, res) => {
  const { id } = req.params;

  try {
    await query(
      "UPDATE notifications SET status = 'SENT' WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark notification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
