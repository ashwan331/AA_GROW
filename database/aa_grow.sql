-- ============================================================
--  AA_GROW  –  MySQL Database Schema + Seed Data
--  Run this file in MySQL Workbench or CLI:
--    mysql -u root -p < aa_grow.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS aa_grow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aa_grow;

-- ─────────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255)    NOT NULL,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('FARMER','RENTER','BUYER','ADMIN') DEFAULT 'FARMER',
  phone         VARCHAR(20),
  farm_name     VARCHAR(255),
  farm_location VARCHAR(255),
  farm_size     VARCHAR(100),
  profile_pic   TEXT,
  otp_verified  TINYINT(1)      DEFAULT 0,
  created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 2. OTP VERIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_verifications (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  otp_code    VARCHAR(6)    NOT NULL,
  expires_at  DATETIME      NOT NULL,
  used        TINYINT(1)    DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- 3. DISEASE SCANS  (Plant Disease Detection)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disease_scans (
  id                       INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id                  INT UNSIGNED  NOT NULL,
  crop_type                VARCHAR(255)  NOT NULL,
  image_url                TEXT,
  disease_detected         VARCHAR(255)  NOT NULL,
  confidence_score         DECIMAL(5,2)  NOT NULL,
  severity                 ENUM('LOW','MEDIUM','HIGH') DEFAULT 'LOW',
  treatment_recommendations TEXT,
  created_at               DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- 4. FERTILIZER RECOMMENDATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fertilizers (
  id                  INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED  NOT NULL,
  crop_name           VARCHAR(255)  NOT NULL,
  soil_type           VARCHAR(100)  NOT NULL,
  nitrogen            DECIMAL(8,2)  NOT NULL,
  phosphorus          DECIMAL(8,2)  NOT NULL,
  potassium           DECIMAL(8,2)  NOT NULL,
  recommended_fertilizer VARCHAR(255),
  recommendation_detail  TEXT,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- 5. MARKETPLACE  (Crop Listings)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED  NOT NULL,
  crop_name    VARCHAR(255)  NOT NULL,
  variety      VARCHAR(255),
  quantity     DECIMAL(10,2) NOT NULL,
  unit         VARCHAR(50)   DEFAULT 'kg',
  price        DECIMAL(10,2) NOT NULL,
  location     VARCHAR(255),
  contact      VARCHAR(50),
  description  TEXT,
  image_url    TEXT,
  status       ENUM('AVAILABLE','SOLD','DELETED') DEFAULT 'AVAILABLE',
  created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- 6. SOIL DATA
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS soil_data (
  id             INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED  NOT NULL,
  moisture_level DECIMAL(5,2)  NOT NULL,
  nitrogen       DECIMAL(5,2),
  phosphorus     DECIMAL(5,2),
  potassium      DECIMAL(5,2),
  ph             DECIMAL(4,2),
  recorded_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- 7. IRRIGATION LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS irrigation_logs (
  id                  INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED  NOT NULL,
  moisture_before     DECIMAL(5,2)  NOT NULL,
  water_volume_liters DECIMAL(10,2) NOT NULL,
  status              ENUM('SUCCESS','FAILED') DEFAULT 'SUCCESS',
  triggered_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- 8. EQUIPMENT RENTALS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rentals (
  id                  INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  owner_id            INT UNSIGNED  NOT NULL,
  item_name           VARCHAR(255)  NOT NULL,
  price_per_day       DECIMAL(10,2) NOT NULL,
  description         TEXT,
  image_url           TEXT,
  availability_status ENUM('AVAILABLE','RENTED','MAINTENANCE') DEFAULT 'AVAILABLE',
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- 9. CHAT HISTORY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_history (
  id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED  NOT NULL,
  message    TEXT          NOT NULL,
  response   TEXT          NOT NULL,
  language   VARCHAR(10)   DEFAULT 'en',
  created_at DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- 10. NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED  NOT NULL,
  title      VARCHAR(255)  NOT NULL,
  message    TEXT          NOT NULL,
  type       ENUM('APP','EMAIL','SMS') DEFAULT 'APP',
  status     ENUM('SENT','PENDING','FAILED') DEFAULT 'PENDING',
  created_at DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
--  SEED DATA
-- ============================================================

-- Demo Users  (password = "password123"  bcrypt hash)
INSERT INTO users (id, name, email, password_hash, role, phone, farm_name, farm_location, farm_size, otp_verified) VALUES
(1, 'Rajesh Kumar',    'farmer@example.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'FARMER', '9876543210', 'Rajesh Farm',    'Anantapur, AP', '10 acres', 1),
(2, 'Priya Sharma',    'priya@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'FARMER', '9123456780', 'Sharma Agro',    'Kurnool, AP',   '5 acres',  1),
(3, 'AgriEquip Co.',   'renter@example.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'RENTER', '9988776655', 'AgriEquip Depot','Hyderabad, TS', NULL,       1),
(4, 'Fresh Foods Inc.','buyer@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'BUYER',  '9001122334', NULL,             'Bangalore, KA', NULL,       1)
ON DUPLICATE KEY UPDATE id = id;

-- Sample soil data
INSERT INTO soil_data (user_id, moisture_level, nitrogen, phosphorus, potassium, ph) VALUES
(1, 45.2, 12.5, 8.1, 5.4, 6.5),
(1, 42.1, 11.8, 7.9, 5.2, 6.4),
(2, 38.0, 10.0, 6.5, 4.8, 6.8)
ON DUPLICATE KEY UPDATE id = id;

-- Sample marketplace listings
INSERT INTO marketplace (user_id, crop_name, variety, quantity, unit, price, location, contact, description, status) VALUES
(1, 'Wheat',  'Sharbati', 5000, 'kg', 45.00,  'Anantapur, AP', '9876543210', 'Premium quality wheat harvested this season.',  'AVAILABLE'),
(1, 'Rice',   'Basmati',  2000, 'kg', 80.00,  'Anantapur, AP', '9876543210', 'Aromatic long-grain basmati rice.',             'AVAILABLE'),
(2, 'Tomato', 'Hybrid',   500,  'kg', 20.00,  'Kurnool, AP',   '9123456780', 'Fresh tomatoes from organic farm.',             'AVAILABLE')
ON DUPLICATE KEY UPDATE id = id;

-- Sample fertilizer recommendations
INSERT INTO fertilizers (user_id, crop_name, soil_type, nitrogen, phosphorus, potassium, recommended_fertilizer, recommendation_detail) VALUES
(1, 'Wheat', 'Loamy', 30, 20, 10, 'Urea + DAP', 'Apply 120 kg Urea and 60 kg DAP per hectare during sowing. Top-dress with 60 kg Urea at tillering stage.'),
(1, 'Rice',  'Clay',  40, 15, 15, 'NPK 20-10-10', 'Apply NPK 20-10-10 at 150 kg/ha as basal dose. Supplement with zinc sulfate 25 kg/ha.')
ON DUPLICATE KEY UPDATE id = id;

-- Sample disease scans
INSERT INTO disease_scans (user_id, crop_type, image_url, disease_detected, confidence_score, severity, treatment_recommendations) VALUES
(1, 'Tomato', 'scan_001.jpg', 'Early Blight',    89.00, 'MEDIUM', 'Apply copper-based fungicide. Remove infected leaves. Ensure proper plant spacing.'),
(1, 'Cotton', 'scan_002.jpg', 'Healthy',          95.00, 'LOW',    'No action needed. Continue regular watering and monitoring.'),
(2, 'Wheat',  'scan_003.jpg', 'Powdery Mildew',   82.00, 'HIGH',   'Apply sulfur-based fungicide immediately. Improve air circulation. Avoid overhead irrigation.')
ON DUPLICATE KEY UPDATE id = id;

-- Sample rentals
INSERT INTO rentals (owner_id, item_name, price_per_day, description, availability_status) VALUES
(3, 'John Deere 5050D Tractor', 4500.00, '50 HP tractor in excellent condition with full service history.', 'AVAILABLE'),
(3, 'Rotavator 6 Feet',          1500.00, 'Heavy duty rotavator suitable for all soil types.',               'AVAILABLE'),
(3, 'Paddy Transplanter',        2000.00, '8-row paddy transplanter, well maintained.',                      'AVAILABLE')
ON DUPLICATE KEY UPDATE id = id;

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type, status) VALUES
(1, 'Smart Irrigation Triggered',  '500L of water applied to Field A automatically.',            'APP', 'SENT'),
(1, 'New Buyer Inquiry',            'Fresh Foods Inc. is interested in your Wheat listing.',       'APP', 'PENDING'),
(1, 'Disease Risk Alert',           'High humidity detected – risk of fungal infection in rice.',  'APP', 'SENT'),
(2, 'Fertilizer Reminder',          'Time to apply second dose of NPK for wheat crop.',            'APP', 'PENDING')
ON DUPLICATE KEY UPDATE id = id;
