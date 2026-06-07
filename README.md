# 🍔 QuickBite - Food Ordering Application

A mobile-based food ordering application developed using React Native, Node.js, Express.js, and MongoDB. The system allows customers to browse food items, place orders, select delivery options, manage addresses, make payments, and track order status.

## 📱 Features

### Customer Features
- User Registration and Login
- Browse Food Menu
- Search and Filter Food Items
- Add Items to Cart
- Manage Cart Quantities
- Place Orders
- Delivery Address Management
- Payment Selection
  - Cash on Delivery (COD)
  - Online Transfer
- View Order History
- Track Order Status
- Submit and View Reviews

### Admin Features
- Manage Food Items
  - Add Food
  - Update Food
  - Delete Food
  - Manage Availability
- View Customer Orders
- Update Order Status
- Manage Payments
- View Online Transfer Receipts

### Delivery Features
- View Assigned Deliveries
- Update Delivery Status

---

## 🛠️ Technology Stack

### Frontend
- React Native
- Expo Router
- AsyncStorage

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- JWT (JSON Web Token)
- bcryptjs

### Version Control
- Git
- GitHub

---

## 📂 Project Structure

```text
online-food-ordering-system/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── assets/
│   ├── package.json
│   └── app.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kavindugayantha04/online-food-ordering-system.git
cd online-food-ordering-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Start Backend Server

```bash
npm start
```

or

```bash
npm run dev
```

### 5. Install Mobile App Dependencies

```bash
cd ../mobile-app
npm install
```

### 6. Start Expo Application

```bash
npx expo start
```

---

## 🔐 Security Features

- Password Hashing using bcryptjs
- JWT Authentication
- Protected API Routes
- Input Validation






