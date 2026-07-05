// src/controllers/marketplace.controller.js
const { query } = require('../config/db');

/* ─── GET ALL AVAILABLE LISTINGS ──────────────────────── */
exports.getAllListings = async (req, res) => {
  const { search, crop, limit = 20, offset = 0 } = req.query;

  try {
    let sql    = `SELECT m.*, u.name AS farmer_name, u.farm_location AS farmer_location
                  FROM marketplace m JOIN users u ON m.user_id = u.id
                  WHERE m.status = 'AVAILABLE'`;
    const params = [];

    if (search) {
      sql += ' AND (m.crop_name LIKE ? OR m.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (crop) {
      sql += ' AND m.crop_name = ?';
      params.push(crop);
    }

    sql += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows]  = await query(sql, params);
    const [total] = await query("SELECT COUNT(*) AS cnt FROM marketplace WHERE status = 'AVAILABLE'");
    res.json({ listings: rows, total: total[0].cnt });
  } catch (err) {
    console.error('Get listings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── GET MY LISTINGS ─────────────────────────────────── */
exports.getMyListings = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await query(
      "SELECT * FROM marketplace WHERE user_id = ? AND status != 'DELETED' ORDER BY created_at DESC",
      [userId]
    );
    res.json({ listings: rows });
  } catch (err) {
    console.error('Get my listings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── GET SINGLE LISTING ──────────────────────────────── */
exports.getListing = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await query(
      `SELECT m.*, u.name AS farmer_name, u.phone AS farmer_phone, u.farm_location AS farmer_location
       FROM marketplace m JOIN users u ON m.user_id = u.id
       WHERE m.id = ? AND m.status != 'DELETED'`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Listing not found.' });
    res.json({ listing: rows[0] });
  } catch (err) {
    console.error('Get listing error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── CREATE LISTING ──────────────────────────────────── */
exports.createListing = async (req, res) => {
  const { crop_name, variety, quantity, unit = 'kg', price, location, contact, description } = req.body;

  if (!crop_name || !quantity || !price) {
    return res.status(400).json({ error: 'crop_name, quantity, and price are required.' });
  }

  try {
    const [result] = await query(
      `INSERT INTO marketplace (user_id, crop_name, variety, quantity, unit, price, location, contact, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        crop_name,
        variety    || null,
        parseFloat(quantity),
        unit,
        parseFloat(price),
        location   || req.user.farm_location || null,
        contact    || req.user.phone         || null,
        description|| null,
      ]
    );

    const [saved] = await query('SELECT * FROM marketplace WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Listing created successfully.', listing: saved[0] });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── UPDATE LISTING ──────────────────────────────────── */
exports.updateListing = async (req, res) => {
  const { id }   = req.params;
  const { crop_name, variety, quantity, unit, price, location, contact, description, status } = req.body;

  try {
    const [rows] = await query("SELECT * FROM marketplace WHERE id = ? AND user_id = ? AND status != 'DELETED'", [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Listing not found.' });

    const cur = rows[0];
    await query(
      `UPDATE marketplace SET crop_name = ?, variety = ?, quantity = ?, unit = ?, price = ?,
       location = ?, contact = ?, description = ?, status = ?, updated_at = NOW() WHERE id = ?`,
      [
        crop_name   || cur.crop_name,
        variety     !== undefined ? variety     : cur.variety,
        quantity    !== undefined ? parseFloat(quantity) : cur.quantity,
        unit        || cur.unit,
        price       !== undefined ? parseFloat(price)    : cur.price,
        location    !== undefined ? location    : cur.location,
        contact     !== undefined ? contact     : cur.contact,
        description !== undefined ? description : cur.description,
        status      || cur.status,
        id,
      ]
    );

    const [updated] = await query('SELECT * FROM marketplace WHERE id = ?', [id]);
    res.json({ message: 'Listing updated.', listing: updated[0] });
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── DELETE (SOFT) LISTING ───────────────────────────── */
exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await query("SELECT id FROM marketplace WHERE id = ? AND user_id = ?", [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Listing not found.' });

    await query("UPDATE marketplace SET status = 'DELETED', updated_at = NOW() WHERE id = ?", [id]);
    res.json({ message: 'Listing deleted successfully.' });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── GET RENTALS ─────────────────────────────────────── */
exports.getRentals = async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT r.*, u.name AS owner_name FROM rentals r JOIN users u ON r.owner_id = u.id WHERE r.availability_status = 'AVAILABLE' ORDER BY r.created_at DESC"
    );
    res.json({ rentals: rows });
  } catch (err) {
    console.error('Get rentals error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ─── CREATE RENTAL ───────────────────────────────────── */
exports.createRental = async (req, res) => {
  const { item_name, price_per_day, description } = req.body;

  if (!item_name || !price_per_day) {
    return res.status(400).json({ error: 'item_name and price_per_day are required.' });
  }

  try {
    const [result] = await query(
      'INSERT INTO rentals (owner_id, item_name, price_per_day, description) VALUES (?, ?, ?, ?)',
      [req.user.id, item_name, parseFloat(price_per_day), description || null]
    );
    const [saved] = await query('SELECT * FROM rentals WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Rental listing created.', rental: saved[0] });
  } catch (err) {
    console.error('Create rental error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
