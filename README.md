# FreshCart - Full-Stack Grocery Delivery Platform 🛒🥬

FreshCart is a comprehensive, full-stack MERN (MongoDB, Express, React, Node.js) grocery subscription and delivery platform. It features real-time location tracking, multi-language support, a dynamic admin dashboard, an AI-suggested smart basket, and a robust subscription system for daily/weekly deliveries.

## 🚀 Features

### For Customers
- **Authentication:** Secure JWT-based login and registration.
- **Smart Basket & Catalog:** AI-suggested products based on habits and a full interactive shop.
- **Subscriptions:** Subscribe to essential items (e.g., milk, bread) for daily, weekly, or monthly delivery.
- **Delivery Slot Picker:** Choose convenient delivery times.
- **Live Location:** Geolocation tracking to ensure accurate deliveries.
- **Multi-Language Support:** Browse the application in 8 different languages.
- **Cart & Payments:** Seamless checkout process integrated with Razorpay.
- **Order Tracking:** Monitor order status from processing to delivery.
- **Dark Mode:** System and manual dark mode toggle.

### For Administrators
- **Admin Dashboard:** Access analytics and revenue charts.
- **Order Management:** Update order statuses (Processing, Out for Delivery, Delivered).
- **Product Inventory:** Add, edit, and delete products. Toggle stock statuses.
- **User Management:** View registered users and roles.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Redux Toolkit (State Management)
- Tailwind CSS v4 (Styling)
- React Router DOM (Routing)
- Recharts (Analytics Data Visualization)
- Lucide React (Icons)
- React Hook Form & Zod (Form Validation)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for Authentication
- Razorpay API (Payments integration)
- Cloudinary (Image handling)
- Twilio (SMS Notifications)
- Node-cron (Automated background jobs for billing and slots)

## 📦 Project Structure

```
.
├── client/           # React Frontend Application
│   ├── src/          # Source code (Components, Pages, Redux Store)
│   ├── public/       # Static assets and images
│   └── vite.config.js
└── server/           # Express Backend Server
    ├── controllers/  # Route controllers (Auth, Products, Orders, etc.)
    ├── models/       # Mongoose Schemas
    ├── routes/       # Express route definitions
    ├── jobs/         # Cron jobs for automated tasks
    ├── middleware/   # Custom middlewares (Auth, Error Handling)
    └── server.js     # Entry point
```

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or Local)
- Razorpay, Cloudinary, and Twilio credentials (optional but recommended for full features)

### 1. Clone the repository
```bash
git clone https://github.com/Sharanubasava-1/Full-Stack-Ecommerce-Grocery.git
cd Full-Stack-Ecommerce-Grocery
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory using the following template:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Admin Setup
To access the admin panel, you can use the built-in script to create a superadmin:
```bash
cd server
node scripts/createAdmin.js
```
*Default Credentials: `superadmin@grocery.com` / `SuperAdmin`*

## 🌐 Deployment
This project is configured for deployment on cloud platforms like **Render**. 
- The backend runs as a Web Service.
- The frontend runs as a Static Site. *(Note: Ensure you configure a redirect rule `/*` -> `/index.html` on your static hosting provider for React Router to work correctly).*

## 📄 License
This project is licensed under the MIT License.
