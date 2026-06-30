# ErythroShare - Server (Backend)

## 📌 Purpose
The backend API for ErythroShare providing robust and scalable services for the blood donation platform. It manages user data, role-based access control, donation request processing, and connects to the MongoDB database to securely persist application data.

## 🔗 Live URL
**Live Server API Endpoint:** [https://l1-a10-erythroshare-server.onrender.com]

## 🌟 Key Features
- **RESTful API:** Clean API structure built with Express.js.
- **Database Integration:** Direct integration with MongoDB using the official Node.js driver for efficient querying.
- **CORS Protection:** Handled via the `cors` middleware for secure cross-origin resource sharing between client and server.
- **Environment Management:** Safe configuration using `dotenv`.

## 📦 NPM Packages Used
- `express` - Fast node.js network application framework
- `mongodb` - Official MongoDB driver for Node.js
- `cors` - Middleware to enable CORS
- `dotenv` - Loads environment variables from a `.env` file
- `jsonwebtoken` - Generates tokens for secure authentication and authorization
