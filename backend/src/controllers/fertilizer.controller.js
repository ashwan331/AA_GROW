// src/controllers/fertilizer.controller.js
const { query } = require('../config/db');

/* ─── Fertilizer recommendation engine ───────────────── */
const recommendFertilizer = (crop, soilType, N, P, K) => {
  // Simple rule-based recommendation engine
  // In production, replace with ML model or Gemini AI call
  const recommendations = {
    wheat: {
      loamy:  { name: 'Urea + DAP',       detail: 'Apply 120 kg Urea and 60 kg DAP per hectare at sowing. Top-dress 60 kg Urea at tillering. Supplement 20 kg K2O/ha.' },
      clay:   { name: 'NPK 14-35-14',     detail: 'Apply NPK 14-35-14 at 150 kg/ha as basal dose. Top-dress with 60 kg Urea at first irrigation.' },
      sandy:  { name: 'NPK 20-20-0 + MOP', detail: 'Split application recommended. Apply NPK 20-20-0 at 100 kg/ha + 25 kg MOP. Top-dress 40 kg Urea at crown root initiation.' },
      silt:   { name: 'Urea + SSP',        detail: 'Apply 80 kg Urea + 125 kg SSP per hectare. Supplement zinc sulfate 25 kg/ha if pH > 7.5.' },
    },
    rice: {
      clay:   { name: 'NPK 20-10-10',     detail: 'Apply NPK 20-10-10 at 150 kg/ha as basal dose. Supplement zinc sulfate 25 kg/ha.' },
      loamy:  { name: 'Urea + SSP + MOP', detail: 'Apply 100 kg Urea, 200 kg SSP, 40 kg MOP/ha. Top-dress 50 kg Urea at panicle initiation.' },
      sandy:  { name: 'Slow-release NPK', detail: 'Use coated urea 90 kg/ha + SSP 125 kg/ha + MOP 40 kg/ha. Organic manure 5 t/ha recommended.' },
      silt:   { name: 'NPK 12-32-16',     detail: 'Apply NPK 12-32-16 at 140 kg/ha. Top-dress 60 kg Urea at active tillering stage.' },
    },
    tomato: {
      loamy:  { name: 'NPK 19-19-19',     detail: 'Apply NPK 19-19-19 at 200 kg/ha. Add calcium nitrate 50 kg/ha to prevent blossom end rot. Fertigation preferred.' },
      clay:   { name: 'NPK 13-40-13',     detail: 'Basal application of NPK 13-40-13 at 175 kg/ha. Drip fertigation with water-soluble fertilizers recommended.' },
      sandy:  { name: 'Fertigation NPK',  detail: 'Split into 4 applications. Use soluble NPK 20-20-20 at 2 g/L through drip. Add micronutrient mix.' },
      silt:   { name: 'NPK 15-15-15 + Boron', detail: 'Apply 160 kg NPK 15-15-15/ha. Add borax 2 kg/ha for fruit setting. Foliar spray of calcium chloride at flowering.' },
    },
    cotton: {
      loamy:  { name: 'Urea + MOP + SSP', detail: 'Apply 80 kg N, 40 kg P2O5, 40 kg K2O per hectare. Split N into 3 doses: sowing, 45 DAS, 90 DAS.' },
      clay:   { name: 'NPK 12-32-16',     detail: 'Basal NPK 12-32-16 at 200 kg/ha. Top-dress urea at square formation and boll development.' },
      sandy:  { name: 'Controlled Release Fertilizer', detail: 'Use CRF (N-P-K 15-9-12) at 300 kg/ha. Reduce leaching losses with organic matter addition.' },
      silt:   { name: 'NPK 20-10-10 + Micro', detail: 'NPK 20-10-10 at 150 kg/ha + micronutrient mix. Foliar boron at bud formation.' },
    },
    maize: {
      loamy:  { name: 'Urea + DAP + MOP', detail: '120 kg N, 60 kg P2O5, 60 kg K2O/ha. Apply 1/3 N + full P + K at sowing; 2/3 N split at knee height and tasseling.' },
      clay:   { name: 'NPK 16-16-16',     detail: 'Basal NPK 16-16-16 at 200 kg/ha. Top-dress with 80 kg Urea at V6 stage.' },
      sandy:  { name: 'IFFCO NP + MOP',   detail: 'Use 150 kg IFFCO NP + 60 kg MOP/ha. Light, frequent irrigation to minimise nutrient leaching.' },
      silt:   { name: 'NPK 12-32-16',     detail: 'NPK 12-32-16 at 180 kg/ha basal. Top-dress 100 kg Urea in 2 splits at 25 and 45 DAS.' },
    },
    default: {
      default: { name: 'Balanced NPK 17-17-17', detail: `Customised recommendation: N=${N} P=${P} K=${K}. Apply balanced NPK 17-17-17 at 150 kg/ha as a general starting point. Conduct soil test for precise adjustment.` },
    },
  };

  const cropLower = (crop || '').toLowerCase();
  const soilLower = (soilType || '').toLowerCase();

  const cropRecs = recommendations[cropLower] || recommendations.default;
  const rec      = cropRecs[soilLower] || cropRecs.loamy || cropRecs.default || recommendations.default.default;

  // Adjust based on N, P, K values
  let adjustments = [];
  if (N < 15) adjustments.push('Low nitrogen detected – increase Urea application by 20%.');
  if (P < 8)  adjustments.push('Low phosphorus – add extra SSP or DAP.');
  if (K < 5)  adjustments.push('Low potassium – supplement with MOP (Muriate of Potash).');

  return {
    recommended_fertilizer: rec.name,
    recommendation_detail:  rec.detail + (adjustments.length ? ' Note: ' + adjustments.join(' ') : ''),
  };
};

/* ─── CREATE RECOMMENDATION ───────────────────────────── */
exports.recommend = async (req, res) => {
  const { crop_name, soil_type, nitrogen, phosphorus, potassium } = req.body;

  if (!crop_name || !soil_type || nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
    return res.status(400).json({ error: 'crop_name, soil_type, nitrogen, phosphorus, and potassium are required.' });
  }

  const N = parseFloat(nitrogen);
  const P = parseFloat(phosphorus);
  const K = parseFloat(potassium);

  if (isNaN(N) || isNaN(P) || isNaN(K)) {
    return res.status(400).json({ error: 'N, P, K values must be numeric.' });
  }

  try {
    const { recommended_fertilizer, recommendation_detail } = recommendFertilizer(crop_name, soil_type, N, P, K);

    const [result] = await query(
      `INSERT INTO fertilizers (user_id, crop_name, soil_type, nitrogen, phosphorus, potassium, recommended_fertilizer, recommendation_detail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, crop_name, soil_type, N, P, K, recommended_fertilizer, recommendation_detail]
    );

    const [saved] = await query('SELECT * FROM fertilizers WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Fertilizer recommendation generated.', recommendation: saved[0] });
  } catch (err) {
    console.error('Fertilizer recommend error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── GET HISTORY ─────────────────────────────────────── */
exports.getHistory = async (req, res) => {
  const userId = req.user.id;
  const limit  = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const [rows]  = await query(
      'SELECT * FROM fertilizers WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    const [total] = await query('SELECT COUNT(*) AS cnt FROM fertilizers WHERE user_id = ?', [userId]);
    res.json({ recommendations: rows, total: total[0].cnt });
  } catch (err) {
    console.error('Get fertilizer history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── DELETE RECOMMENDATION ───────────────────────────── */
exports.deleteRecommendation = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await query('SELECT id FROM fertilizers WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Recommendation not found.' });

    await query('DELETE FROM fertilizers WHERE id = ?', [id]);
    res.json({ message: 'Recommendation deleted.' });
  } catch (err) {
    console.error('Delete recommendation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
