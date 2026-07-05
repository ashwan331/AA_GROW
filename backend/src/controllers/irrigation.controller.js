// src/controllers/irrigation.controller.js
const { query } = require('../config/db');

/* ─── GET SOIL DATA ───────────────────────────────────── */
exports.getSoilData = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await query(
      'SELECT * FROM soil_data WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1',
      [userId]
    );
    const soil = rows[0] || { moisture_level: 45, nitrogen: 12, phosphorus: 8, potassium: 5, ph: 6.5 };
    res.json({ soil });
  } catch (err) {
    console.error('Get soil data error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── ADD SOIL READING ────────────────────────────────── */
exports.addSoilData = async (req, res) => {
  const { moisture_level, nitrogen, phosphorus, potassium, ph } = req.body;

  if (moisture_level === undefined) {
    return res.status(400).json({ error: 'moisture_level is required.' });
  }

  try {
    const [result] = await query(
      `INSERT INTO soil_data (user_id, moisture_level, nitrogen, phosphorus, potassium, ph)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, parseFloat(moisture_level), nitrogen || null, phosphorus || null, potassium || null, ph || null]
    );
    const [saved] = await query('SELECT * FROM soil_data WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Soil data recorded.', soil: saved[0] });
  } catch (err) {
    console.error('Add soil data error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── TRIGGER IRRIGATION ──────────────────────────────── */
exports.triggerIrrigation = async (req, res) => {
  const { moisture_before, water_volume_liters } = req.body;

  try {
    const [result] = await query(
      `INSERT INTO irrigation_logs (user_id, moisture_before, water_volume_liters, status)
       VALUES (?, ?, ?, 'SUCCESS')`,
      [req.user.id, parseFloat(moisture_before) || 45, parseFloat(water_volume_liters) || 500]
    );

    // Create notification
    await query(
      `INSERT INTO notifications (user_id, title, message, type, status)
       VALUES (?, 'Smart Irrigation Triggered', ?, 'APP', 'SENT')`,
      [req.user.id, `${water_volume_liters || 500}L of water applied to your field.`]
    );

    const [saved] = await query('SELECT * FROM irrigation_logs WHERE id = ?', [result.insertId]);
    res.json({ message: 'Irrigation triggered successfully.', log: saved[0] });
  } catch (err) {
    console.error('Trigger irrigation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── GET IRRIGATION LOGS ─────────────────────────────── */
exports.getLogs = async (req, res) => {
  const userId = req.user.id;
  const limit  = parseInt(req.query.limit) || 10;

  try {
    const [rows] = await query(
      'SELECT * FROM irrigation_logs WHERE user_id = ? ORDER BY triggered_at DESC LIMIT ?',
      [userId, limit]
    );
    res.json({ logs: rows });
  } catch (err) {
    console.error('Get irrigation logs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── WEATHER ADVISORY (mock / demo) ─────────────────── */
exports.getWeatherAdvisory = async (req, res) => {
  // In production: call OpenWeatherMap API, then generate Gemini advisory
  const advisories = [
    {
      forecast: { temp: 28, humidity: 65, condition: 'Partly Cloudy', precipitation_chance: 20 },
      recommendations: [
        'Good day for pesticide spraying – wind is calm and no immediate rain expected.',
        'Soil moisture is optimal, you can skip irrigation today.',
      ],
    },
    {
      forecast: { temp: 32, humidity: 80, condition: 'Hot & Humid',  precipitation_chance: 60 },
      recommendations: [
        'High humidity increases risk of fungal disease – inspect crops today.',
        'Rain expected – hold off on irrigation for the next 24 hours.',
      ],
    },
    {
      forecast: { temp: 24, humidity: 55, condition: 'Clear Skies',  precipitation_chance: 5  },
      recommendations: [
        'Ideal conditions for outdoor farm work.',
        'Low moisture forecast – consider light irrigation in the evening.',
      ],
    },
  ];

  const idx = Math.floor(Math.random() * advisories.length);
  res.json(advisories[idx]);
};
