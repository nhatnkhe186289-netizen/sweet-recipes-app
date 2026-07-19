const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const routes = require("./src/routes");
const {
  notFound,
  errorHandler,
} = require("./src/middlewares/error.middleware");

dotenv.config();
console.log("MONGODB_URI =", process.env.MONGODB_URI);

// Connect to Database
connectDB();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Welcome Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Sweet Recipe & Favorites API!" });
});

// API Routes
app.use("/api", routes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
