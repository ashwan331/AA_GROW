// src/controllers/dashboard.controller.js
const { query } = require('../config/db');
const PDFDocument = require('pdfkit');

/* ─── GET DASHBOARD SUMMARY ───────────────────────────── */
exports.getSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    // Count marketplace listings
    const [listings]       = await query("SELECT COUNT(*) AS cnt FROM marketplace WHERE user_id = ? AND status = 'AVAILABLE'", [userId]);
    // Latest soil record
    const [soil]           = await query('SELECT * FROM soil_data WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1', [userId]);
    // Unread notifications
    const [alerts]         = await query("SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND status = 'PENDING'", [userId]);
    // Disease scans this month
    const [scans]          = await query('SELECT COUNT(*) AS cnt FROM disease_scans WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)', [userId]);
    // Recent activity (last 5 notifications)
    const [recentActivity] = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);
    // Recent disease scans (last 3)
    const [recentScans]    = await query('SELECT * FROM disease_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 3', [userId]);
    // Revenue chart (marketplace – last 6 months sold value, mocked if no sales)
    const [revenue]        = await query(
      `SELECT DATE_FORMAT(created_at, '%b') AS month, SUM(price * quantity) AS total
       FROM marketplace WHERE user_id = ? AND status = 'SOLD' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY MIN(created_at)`,
      [userId]
    );

    const soilRecord = soil[0] || { moisture_level: 45, nitrogen: 12, phosphorus: 8, potassium: 5, ph: 6.5 };

    // Compute a simple soil health index
    const soilHealthIndex = Math.min(100, Math.round(
      ((soilRecord.moisture_level || 45) / 100) * 40 +
      ((soilRecord.ph            || 6.5) / 14)  * 30 +
      ((soilRecord.nitrogen      || 12)  / 50)   * 30
    ));

    res.json({
      totalListings:   listings[0].cnt,
      activeScans:     scans[0].cnt,
      soilHealthIndex,
      unreadAlerts:    alerts[0].cnt,
      soil:            soilRecord,
      recentActivity,
      recentScans,
      revenueChart:    revenue.length ? revenue : [
        { month: 'Jan', total: 4000 },
        { month: 'Feb', total: 3000 },
        { month: 'Mar', total: 5000 },
        { month: 'Apr', total: 4500 },
        { month: 'May', total: 6000 },
        { month: 'Jun', total: 8000 },
      ],
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── EXPORT PDF REPORT ───────────────────────────────── */
exports.exportPDF = async (req, res) => {
  const userId = req.user.id;

  try {
    const [soil]       = await query('SELECT * FROM soil_data WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1', [userId]);
    const [scans]      = await query('SELECT * FROM disease_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);
    const [fertilizers]= await query('SELECT * FROM fertilizers WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=AA_GROW_Report_${Date.now()}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#16a34a').text('AA_GROW', { align: 'center' });
    doc.fontSize(12).fillColor('#555').text('AI Agriculture Growth Assistant', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).fillColor('#000').text(`Farmer Report`, { align: 'center' });
    doc.fontSize(10).fillColor('#555').text(`Generated for: ${req.user.name}  |  ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#16a34a');
    doc.moveDown();

    // Soil health
    const soilData = soil[0] || {};
    doc.fontSize(14).fillColor('#16a34a').text('Soil Health Overview');
    doc.fontSize(10).fillColor('#333');
    doc.text(`Moisture Level: ${soilData.moisture_level ?? 'N/A'} %`);
    doc.text(`Nitrogen: ${soilData.nitrogen ?? 'N/A'} mg/kg`);
    doc.text(`Phosphorus: ${soilData.phosphorus ?? 'N/A'} mg/kg`);
    doc.text(`Potassium: ${soilData.potassium ?? 'N/A'} mg/kg`);
    doc.text(`pH: ${soilData.ph ?? 'N/A'}`);
    doc.moveDown();

    // Disease scans
    doc.fontSize(14).fillColor('#16a34a').text('Recent Disease Scans');
    if (scans.length === 0) {
      doc.fontSize(10).fillColor('#555').text('No disease scans on record.');
    } else {
      scans.forEach((s, i) => {
        doc.fontSize(10).fillColor('#333').text(`${i + 1}. ${s.crop_type} – ${s.disease_detected} (${s.confidence_score}% confidence, ${s.severity})`);
        doc.fontSize(9).fillColor('#666').text(`   Treatment: ${s.treatment_recommendations}`);
      });
    }
    doc.moveDown();

    // Fertilizer recommendations
    doc.fontSize(14).fillColor('#16a34a').text('Fertilizer Recommendations');
    if (fertilizers.length === 0) {
      doc.fontSize(10).fillColor('#555').text('No fertilizer records on record.');
    } else {
      fertilizers.forEach((f, i) => {
        doc.fontSize(10).fillColor('#333').text(`${i + 1}. ${f.crop_name} (${f.soil_type} soil) – ${f.recommended_fertilizer}`);
        doc.fontSize(9).fillColor('#666').text(`   N:${f.nitrogen} P:${f.phosphorus} K:${f.potassium}`);
      });
    }
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#16a34a');
    doc.fontSize(9).fillColor('#999').text('This report was automatically generated by AA_GROW AI Agriculture Assistant.', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};
