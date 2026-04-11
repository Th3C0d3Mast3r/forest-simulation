# Forest Simulation Backend Guide

This backend handles safari registrations, ticket management, and RFID tag mapping with automated TTL (Time-To-Live).

## 🚀 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Features**: RESTful API, MongoDB TTL Indexes, CORS enabled.

---

## 🛠️ Data Models

### 1. Registration (`Reg`)
Stored in `backend/models/reg.model.js`. Represents a group booking.
- `uid`: Unique string identifier (Custom ID).
- `name`: Array of strings (List of passengers).
- `mobile`: String (Phone number).
- `safariType`: Enum (`T1`, `T2`, `T3`).
- `paymentStatus`: Boolean.
- `ticketCreated`: Boolean.

### 2. RFID Tag (`Rfid`)
Stored in `backend/models/rfid.model.js`. Maps a physical tag to a registration.
- `rfid`: Unique tag ID string.
- `value`: Number (Auto-derived from group size).
- `ttl`: Date (Expiry timestamp).
- `regId`: Reference to the Registration document.

> [!IMPORTANT]
> **Auto-Expiry**: RFID documents are automatically deleted by MongoDB exactly 24 hours after creation using a TTL Index.

---

## 📡 API Reference

### Registration & Tickets (`/ticket`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/ticket/create` | Creates/Updates a booking. Sets `ticketCreated: true`. |
| `GET` | `/ticket/get/:id` | Fetch booking details by MongoDB `_id`. |

**Sample POST Body:**
```json
{
  "uid": "USER_789",
  "name": ["John Doe", "Jane Doe"],
  "mobile": "1234567890",
  "safariType": "T2",
  "paymentStatus": true
}
```

### RFID Management (`/rfid`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/rfid/assign` | Maps an RFID tag to a UID or _id. |
| `GET` | `/rfid/tag/:rfid` | Get group details by scanning Tag ID. |
| `GET` | `/rfid/uid/:uid` | Find a tag by the User's ID or _id. |
| `DELETE` | `/rfid/deactivate/:rfid` | Manually remove a tag before the 24h expiry. |

**Sample Assignment Body:**
```json
{
  "rfid": "RFID_TAG_99",
  "uid": "USER_789"
}
```
*Supports polymorphic lookup: you can send either the custom `uid` string or the MongoDB `_id`.*

---

## ⚙️ Environment Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/forestShi
```

---

## 🧪 Testing with Postman
1. **Register**: Submit a `POST` to `/ticket/create`.
2. **Assign**: Use the `uid` from the previous step to `POST` to `/rfid/assign`.
3. **Verify**: Use `GET` on `/rfid/tag/:rfid` to see the live group data.
