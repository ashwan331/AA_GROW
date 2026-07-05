// src/controllers/disease.controller.js
const { query } = require('../config/db');

/* ─── Gemini AI helper (optional) ────────────────────── */
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch {
    console.warn('Gemini SDK not installed – using mock disease detection.');
  }
}

/* ─── Mock predictions library ───────────────────────── */
const MOCK_DISEASES = [
  {
    disease_detected: 'Early Blight',
    confidence_score: 88.50,
    severity: 'MEDIUM',
    treatment_recommendations:
      'Apply copper-based fungicide (Mancozeb 2g/L) every 7 days. Remove and destroy infected leaves. Ensure proper plant spacing for airflow. Avoid overhead irrigation.',
  },
  {
    disease_detected: 'Late Blight',
    confidence_score: 92.30,
    severity: 'HIGH',
    treatment_recommendations:
      'Apply Metalaxyl + Mancozeb 2.5g/L immediately. Remove severely infected plants. Do not compost infected material. Apply preventively to healthy plants nearby.',
  },
  {
    disease_detected: 'Powdery Mildew',
    confidence_score: 85.00,
    severity: 'MEDIUM',
    treatment_recommendations:
      'Spray sulfur-based fungicide or potassium bicarbonate solution. Improve air circulation. Avoid excessive nitrogen fertilization. Water at the base of plants.',
  },
  {
    disease_detected: 'Leaf Rust',
    confidence_score: 79.40,
    severity: 'MEDIUM',
    treatment_recommendations:
      'Apply propiconazole or tebuconazole fungicide. Remove infected leaves. Rotate crops next season. Use rust-resistant varieties where available.',
  },
  {
    disease_detected: 'Healthy Plant',
    confidence_score: 97.10,
    severity: 'LOW',
    treatment_recommendations:
      'No disease detected. Continue regular monitoring, proper watering, and balanced fertilization. Maintain good field hygiene.',
  },
  {
    disease_detected: 'Bacterial Leaf Spot',
    confidence_score: 83.70,
    severity: 'HIGH',
    treatment_recommendations:
      'Apply copper-based bactericide. Avoid working in fields when wet. Remove infected plant debris. Ensure good drainage and airflow.',
  },
];

const getMockPrediction = () =>
  MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];

/* ─── DETECT DISEASE ──────────────────────────────────── */
exports.detectDisease = async (req, res) => {
  const { base64Image, crop_type = 'Unknown' } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: 'base64Image is required.' });
  }

  try {
    let analysis;

    if (genAI) {
      // --- Real Gemini AI prediction ---
      const model      = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const imageParts = [{ inlineData: { data: base64Data, mimeType: 'image/jpeg' } }];
      const prompt = `You are an expert plant pathologist. Analyze this crop/plant image.
Return ONLY a valid JSON object with these exact keys:
- disease_detected (string, e.g., "Late Blight" or "Healthy Plant")
- confidence_score (number 0-100, e.g., 92.5)
- severity ("LOW", "MEDIUM", or "HIGH")
- treatment_recommendations (string, practical actionable advice under 100 words)`;

      const result       = await model.generateContent([prompt, ...imageParts]);
      const responseText = result.response.text();
      const jsonMatch    = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON from AI');
      }
    } else {
      // --- Mock prediction ---
      analysis = getMockPrediction();
    }

    // Save to database
    const [result] = await query(
      `INSERT INTO disease_scans (user_id, crop_type, image_url, disease_detected, confidence_score, severity, treatment_recommendations)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        crop_type,
        'base64_image',
        analysis.disease_detected,
        parseFloat(analysis.confidence_score) || 0,
        analysis.severity || 'LOW',
        analysis.treatment_recommendations,
      ]
    );

    const [saved] = await query('SELECT * FROM disease_scans WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Disease detection complete.', scan: saved[0] });
  } catch (err) {
    console.error('Disease detection error:', err);
    res.status(500).json({ error: 'Failed to analyse image.' });
  }
};

/* ─── GET HISTORY ─────────────────────────────────────── */
exports.getHistory = async (req, res) => {
  const userId = req.user.id;
  const limit  = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const [rows]  = await query(
      'SELECT * FROM disease_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    const [total] = await query('SELECT COUNT(*) AS cnt FROM disease_scans WHERE user_id = ?', [userId]);
    res.json({ scans: rows, total: total[0].cnt });
  } catch (err) {
    console.error('Get scan history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── DELETE SCAN ─────────────────────────────────────── */
exports.deleteScan = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await query('SELECT id FROM disease_scans WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Scan not found.' });

    await query('DELETE FROM disease_scans WHERE id = ?', [id]);
    res.json({ message: 'Scan deleted.' });
  } catch (err) {
    console.error('Delete scan error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
