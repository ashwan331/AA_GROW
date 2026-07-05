# AA_GROW – Complete API Documentation

Base URL: `http://localhost:5000`

---

## Authentication

All protected endpoints require the header:
```
Authorization: Bearer <token>
```
The token is returned from `/api/auth/login` and `/api/auth/register`.

---

## 1. Auth Endpoints

### POST /api/auth/register
Register a new farmer account.

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "password": "securepass123",
  "role": "FARMER",
  "phone": "9876543210",
  "farm_name": "Rajesh Farm",
  "farm_location": "Anantapur, AP",
  "farm_size": "10 acres"
}
```
**Response 201:**
```json
{
  "message": "Registration successful. Please verify OTP.",
  "token": "eyJhbGci...",
  "user": { "id": 5, "name": "Rajesh Kumar", "email": "...", "role": "FARMER", ... },
  "demo_otp": "483021"
}
```

---

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{ "email": "farmer@example.com", "password": "password123" }
```
**Response 200:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Rajesh Kumar", "email": "farmer@example.com", "role": "FARMER" }
}
```

---

### POST /api/auth/verify-otp
Verify OTP sent after registration.

**Request Body:**
```json
{ "user_id": 5, "otp": "483021" }
```
**Response 200:**
```json
{ "message": "OTP verified successfully." }
```

---

### POST /api/auth/resend-otp
Resend a new OTP.

**Request Body:**
```json
{ "user_id": 5 }
```

---

### GET /api/auth/me  🔒
Get logged-in user's profile.

**Response:**
```json
{
  "user": {
    "id": 1, "name": "Rajesh Kumar", "email": "farmer@example.com",
    "role": "FARMER", "phone": "9876543210",
    "farm_name": "Rajesh Farm", "farm_location": "Anantapur, AP",
    "farm_size": "10 acres", "otp_verified": 1
  }
}
```

---

### PUT /api/auth/profile  🔒
Update profile fields.

**Request Body:** (all optional)
```json
{
  "name": "Rajesh K",
  "phone": "9999999999",
  "farm_name": "Rajesh Agro Farm",
  "farm_location": "Anantapur, AP",
  "farm_size": "15 acres"
}
```

---

### PUT /api/auth/change-password  🔒
Change password.

**Request Body:**
```json
{ "current_password": "password123", "new_password": "newpass456" }
```

---

## 2. Dashboard Endpoints

### GET /api/dashboard/summary  🔒
Returns aggregated stats for the dashboard overview.

**Response:**
```json
{
  "totalListings": 2,
  "activeScans": 3,
  "soilHealthIndex": 72,
  "unreadAlerts": 2,
  "soil": { "moisture_level": 45.2, "nitrogen": 12.5, "phosphorus": 8.1, "potassium": 5.4, "ph": 6.5 },
  "recentActivity": [...],
  "recentScans": [...],
  "revenueChart": [
    { "month": "Jan", "total": 4000 },
    { "month": "Feb", "total": 3000 }
  ]
}
```

---

### GET /api/dashboard/export  🔒
Download a PDF farm report.

**Response:** `application/pdf` file download.

---

## 3. Disease Detection

### POST /api/disease  🔒
Analyse a crop image for disease.

**Request Body:**
```json
{
  "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
  "crop_type": "Tomato"
}
```
**Response 201:**
```json
{
  "message": "Disease detection complete.",
  "scan": {
    "id": 4,
    "user_id": 1,
    "crop_type": "Tomato",
    "disease_detected": "Early Blight",
    "confidence_score": "88.50",
    "severity": "MEDIUM",
    "treatment_recommendations": "Apply copper-based fungicide...",
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

### GET /api/disease/history  🔒
Get paginated scan history.

**Query Params:** `?limit=20&offset=0`

---

### DELETE /api/disease/:id  🔒
Delete a scan record.

---

## 4. Fertilizer Recommendation

### POST /api/fertilizer  🔒
Get a fertilizer recommendation based on crop and soil.

**Request Body:**
```json
{
  "crop_name": "Wheat",
  "soil_type": "Loamy",
  "nitrogen": 30,
  "phosphorus": 20,
  "potassium": 10
}
```
**Valid soil_type values:** `Loamy`, `Clay`, `Sandy`, `Silt`

**Response 201:**
```json
{
  "message": "Fertilizer recommendation generated.",
  "recommendation": {
    "id": 3,
    "crop_name": "Wheat",
    "soil_type": "Loamy",
    "nitrogen": "30.00",
    "phosphorus": "20.00",
    "potassium": "10.00",
    "recommended_fertilizer": "Urea + DAP",
    "recommendation_detail": "Apply 120 kg Urea and 60 kg DAP per hectare at sowing...",
    "created_at": "..."
  }
}
```

---

### GET /api/fertilizer/history  🔒
Get paginated recommendation history. `?limit=20&offset=0`

---

### DELETE /api/fertilizer/:id  🔒
Delete a recommendation.

---

## 5. Marketplace

### GET /api/market/crops
Browse all available crop listings (public).

**Query Params:** `?search=wheat&crop=Rice&limit=20&offset=0`

**Response:**
```json
{
  "listings": [
    {
      "id": 1, "crop_name": "Wheat", "variety": "Sharbati",
      "quantity": "5000.00", "unit": "kg", "price": "45.00",
      "location": "Anantapur, AP", "contact": "9876543210",
      "farmer_name": "Rajesh Kumar", "status": "AVAILABLE", ...
    }
  ],
  "total": 3
}
```

---

### GET /api/market/crops/mine  🔒
Get current user's listings.

---

### GET /api/market/crops/:id
Get single listing detail (public).

---

### POST /api/market/crops  🔒
Create a new crop listing.

**Request Body:**
```json
{
  "crop_name": "Rice",
  "variety": "Basmati",
  "quantity": 1000,
  "unit": "kg",
  "price": 80,
  "location": "Anantapur, AP",
  "contact": "9876543210",
  "description": "Premium quality basmati rice"
}
```

---

### PUT /api/market/crops/:id  🔒
Update listing fields (any subset).

**Body fields:** `crop_name`, `variety`, `quantity`, `unit`, `price`, `location`, `contact`, `description`, `status` (`AVAILABLE`|`SOLD`)

---

### DELETE /api/market/crops/:id  🔒
Soft-delete (sets status to `DELETED`).

---

### GET /api/market/rentals
Browse equipment rentals (public).

---

### POST /api/market/rentals  🔒
List equipment for rent.

**Request Body:**
```json
{
  "item_name": "John Deere 5050D Tractor",
  "price_per_day": 4500,
  "description": "50HP tractor, excellent condition"
}
```

---

## 6. Irrigation

### GET /api/irrigation/soil  🔒
Get latest soil reading for the user.

**Response:**
```json
{ "soil": { "moisture_level": 45.2, "nitrogen": 12.5, "phosphorus": 8.1, "potassium": 5.4, "ph": 6.5 } }
```

---

### POST /api/irrigation/soil  🔒
Record a new soil reading.

**Request Body:**
```json
{ "moisture_level": 38.5, "nitrogen": 11.0, "phosphorus": 7.5, "potassium": 4.8, "ph": 6.7 }
```

---

### POST /api/irrigation/trigger  🔒
Trigger irrigation cycle.

**Request Body:**
```json
{ "moisture_before": 35, "water_volume_liters": 500 }
```

---

### GET /api/irrigation/logs  🔒
Get recent irrigation history. `?limit=10`

---

### GET /api/irrigation/weather-advisory  🔒
Get weather forecast and farming recommendations.

**Response:**
```json
{
  "forecast": { "temp": 28, "humidity": 65, "condition": "Partly Cloudy", "precipitation_chance": 20 },
  "recommendations": [
    "Good day for spraying pesticides – wind is calm.",
    "Soil moisture is optimal, irrigation can be skipped today."
  ]
}
```

---

## 7. AI Chat

### POST /api/ai/chat  🔒
Chat with the AA_GROW AI assistant.

**Request Body:**
```json
{ "message": "What fertilizer should I use for rice in clay soil?", "language": "en" }
```
**Response:**
```json
{ "response": "For rice in clay soil, use NPK 20-10-10 at 150 kg/ha as basal dose..." }
```

---

### GET /api/ai/chat/history  🔒
Get conversation history. `?limit=50`

---

### GET /api/ai/notifications  🔒
Get user notifications.

---

### PUT /api/ai/notifications/:id/read  🔒
Mark a notification as read.

---

## Error Responses

All errors follow this format:
```json
{ "error": "Human-readable error message" }
```

| Status | Meaning                      |
|--------|------------------------------|
| 400    | Bad request / validation fail |
| 401    | Unauthorized / bad/expired JWT |
| 404    | Resource not found           |
| 409    | Conflict (e.g. email taken)  |
| 500    | Internal server error        |
