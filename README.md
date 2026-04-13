# Forest Simulation - Full Full-Stack Guide 🌲

This guide provides a comprehensive overview of how the Backend architecture works and exactly how the Frontend consumes these routes to create a realistic, real-time forest management dashboard.

---

## 🏗️ 1. Backend API Routes Breakdown

The backend is built with Express + MongoDB and mounted under several resource-specific route files. Here is the exact routing structure.

### 🎟️ Ticketing (`/ticket`) - `routes/ticekting.js`
Handles user safari registrations and ticket generation.
* **`POST /ticket/create`**: Creates a new registration and generates a ticket for the user. Used during checkout.
* **`GET /ticket/get/:id`**: Fetches a specific ticket using its MongoDB Object ID.
* **`GET /ticket/get-by-uid/:uid`**: Fetches a ticket strictly using the user's custom UID.

### 💳 Payment Processing (`/payment`) - `routes/payment.js`
Integrates with the **PayU** gateway.
* **`POST /payment/hash`**: Generates a secure cryptographic hash using `PAYU_KEY` and `PAYU_SALT` (from `.env`) to authenticate the transaction request before sending the user to PayU.
* **`POST/GET /payment/success`**: Webhook callback endpoint hit by PayU when a transaction succeeds. Updates the user's `paymentStatus`.
* **`POST/GET /payment/failure`**: Webhook callback endpoint hit by PayU when a transaction drops or fails.

### 🪪 RFID Management (`/rfid`) - `routes/rfid.js`
Manages real-world physical vehicle/member tracking using hardware scanners.
* **`POST /rfid/assign`**: Associates a newly scanned physical RFID tag to a valid user `uid` (A ticket must have been created first!).
* **`GET /rfid/tag/:rfid`**: Triggered by a physical hardware scanner when a car passes by. Fetches the registration data and **emits a real-time 'tap' event** to the server stream.
* **`GET /rfid/uid/:uid`**: Looks up what RFID tag is currently handed to a specific registration UID.
* **`DELETE /rfid/deactivate/:rfid`**: Unlinks an RFID tag so it can be reused later.
* **`GET /rfid/stream`**: A **Server-Sent Events (SSE)** endpoint. The frontend permanently listens to this route. When a hardware scanner triggers `GET /rfid/tag/:rfid`, the stream instantly pushes the event to the frontend without any reloading.

### 📡 IoT Sensor Data (`/sensor`) - `routes/sensor.js`
Handles continuous physical environmental data from ESP32 nodes.
* **`POST /sensor`**: Endpoint for the physical ESP32 to drop real telemetry parameters (`temp`, `humidity`, `gas`, `vibration`).
* **`GET /sensor/data`**: Returns the latest environmental state.
  * *🌟 Intelligence Features:* If no physical ESP32 data has been `POST`ed in the last 15 seconds, this endpoint automatically enters **Simulation Mode**. It generates a smooth, highly realistic "Random Walk" mathematical simulation based on baseline Indian Summer Forest data (Temp ~32°C, Humidity ~65%), keeping the frontend dynamic while waiting for hardware fallback.

### 🚙 Safari Simulation (`/simulation`) - `routes/simulation.js`
Manages the mock GPS track of a safari gypsy moving through the reserve.
* **`POST /simulation/start`**: Begins a safari trip. Records the start time, sets the speed vector, and clears any previous animal detections.
* **`POST /simulation/detect`**: Endpoint triggered when the car "sights" an animal. Records the current timestamp and mathematical progress of the car.
* **`POST /simulation/stop`**: Halts the tracking.
* **`GET /simulation/status`**: Polled continuously by the frontend map to know where the car is and what animals have been pinned so far.

---

## 🖥️ 2. Frontend Application Overview

The frontend (`frontend/src/app`) extensively consumes these endpoints to generate a stunning, dark-mode real-time operator interface using **Next.js**, **Framer Motion**, and **Leaflet**.

### 🎫 The Ticket Kiosk (`/ticket`)
*(Likely integrated with your `page.jsx` checkout flow)*
* Gathers user group details (Names, Safari Type).
* Hits `/payment/hash` to safely transition the user to the PayU portal.
* Upon success, creates the backend database ticket via `/ticket/create`.

### 📊 Headquarters Dashboard (`/dashboard`)
The main birds-eye view of the reserve.
* **Overview Stats**: Static placeholder data tracking revenue and visitor counts.
* **Live Environment Data**: Native `useEffect` polling hits `/sensor/data` every **5 seconds**. Because of our random-walk addition, you see Temperature, Humidity, AQI, and Seismic levels gracefully fluctuating live.
* **Real-time Check-ins**: Background `EventSource` attached tightly to `/rfid/stream`. When a jeep taps the checkpoint scanner, a slick Framer Motion popup instantly slides in at the bottom right corner showing the safari group's details, persisting for 5 seconds before sliding out automatically.

### 🗺️ The Active Wildlife Tracker (`/dashboard/wildlife`)
The advanced interactive Map View component built on top of **Leaflet**.
* **GPS Overlays**: Directly plots the `TRACK_WAYPOINTS` to draw dashed jeep-trails over an ArcGis satellite layer.
* **Automated Map Polling**: Hits `/simulation/status` strictly every **1.5 seconds**. 
* If a car triggers `/simulation/start`, the Leaflet UI physically animates a car icon moving proportionally along the GPS spline line based on backend tracking.
* **Dynamic Animal Pins**: As the endpoint populates `detections` arrays, the frontend parses them and drops custom red Animal Marker UI dots at the exact geospatial coordinate the backend registered the sighting.
* **Persistent Telemetry**: The IoT panel is permanently pinned top-right. Regardless of if a car is moving, the ESP32 data continues to live-refresh.
* **RFID Support**: The Map UI is fully configured to intercept `/rfid/stream` popups so the operator never misses a gate-tap while analyzing the map.
* **End-of-Trip Report Generation**: When `/simulation/status` concludes, the frontend triggers a massive "Mission Success" UI snapshot overlay. It summarizes average temperature, humidity, run-time, and provides a one-click **Save Data** button to export a structured local `.json` file of the telemetry for analytics.

---

## TEAM
- Akib Patel (Hardware + Hardware Code)
- Adnan Khan (Hardware)
- Devesh Acharya (Hardware Bug + Software)
- Fayyaz Shaikh (Hardware + Hardware Code)
- Neeraj Mahajan (ML pipeline and Integration)
- Rehan Ansari (Software)
