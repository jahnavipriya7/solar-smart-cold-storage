# Solar Smart Cold Storage — MERN Stack

## Setup & Run

### 1. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```
Or set your Atlas URI in `server/.env`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/coldStorage
```

### 3. Run Both Servers
Open two terminals:
```bash
# Terminal 1 — Backend
cd server
npm run dev     # runs on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev     # runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## Features
- 🥦 Select vegetables → automatic temperature recommendation
- ✅ Compatibility check: new vegetables vs. existing slots
- 📡 Live IoT dashboard (temp/humidity/solar — simulated sensors)
- 🔔 Auto-alerts when slots are created/modified
- ☀️ Solar power & battery status monitor
- 📖 Temperature guide for all 25 vegetables

## API Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/slots | Get all slots |
| POST | /api/slots | Create slot |
| POST | /api/slots/check-compat | Check compatibility |
| POST | /api/slots/:id/add-vegetables | Add veggies to slot |
| DELETE | /api/slots/:id | Delete slot |
| GET | /api/alerts | Get alerts |
| DELETE | /api/alerts/:id | Dismiss alert |
