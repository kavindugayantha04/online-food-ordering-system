const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const DB_URL = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(DB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(5000, () => console.log("Server running on port 5000"));


//connect delivery routes
const deliveryRoutes = require("./routes/deliveryRoutes");

const path = require("path");
const fs = require("fs");

// create uploads folder if not exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// serve images publicly
app.use("/uploads", express.static(uploadDir));

app.use("/api/delivery", deliveryRoutes);
