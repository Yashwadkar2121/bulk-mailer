const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const emailRoutes = require("./routes/email");
const campaignRoutes = require("./routes/campaign");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/campaign", campaignRoutes);

app.get("/", (req, res) => res.json({ message: "Bulk Mailer API running" }));

// MongoDB Connection options
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment or use default local
    let mongoURI = process.env.MONGO_URI;
    let connectionType = "";

    // If no URI provided, use local MongoDB
    if (!mongoURI) {
      console.log("⚠️ No MONGO_URI found in environment variables");
      mongoURI = "mongodb://localhost:27017/bulkmailer";
      connectionType = "LOCAL";
    } else if (mongoURI.includes("mongodb+srv")) {
      connectionType = "ATLAS_CLOUD";
    } else if (
      mongoURI.includes("localhost") ||
      mongoURI.includes("127.0.0.1")
    ) {
      connectionType = "LOCAL";
    } else {
      connectionType = "CUSTOM";
    }

    // Connection options for better performance and reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
      family: 4, // Use IPv4, skip trying IPv6
    };

    // For cloud MongoDB (Atlas), add additional options
    if (connectionType === "ATLAS_CLOUD") {
      console.log("🔗 Connecting to MongoDB Atlas (Cloud)...");
      options.retryWrites = true;
      options.retryReads = true;
    } else if (connectionType === "LOCAL") {
      console.log("💾 Connecting to local MongoDB...");
    } else {
      console.log("🔗 Connecting to custom MongoDB...");
    }

    await mongoose.connect(mongoURI, options);

    // Log successful connection with clear type
    const db = mongoose.connection;

    console.log("\n✅ MongoDB Connected Successfully!");
    console.log("═══════════════════════════════════");

    if (connectionType === "ATLAS_CLOUD") {
      console.log("☁️  Connection Type: MONGODB ATLAS (CLOUD)");
      console.log(`📊 Database: ${db.name}`);
      console.log(`📍 Cluster: ${db.host.split(".")[0] || "Unknown"}`);
      console.log(
        `🔗 Connection String: ${mongoURI.replace(/\/\/(.*):(.*)@/, "//***:***@")}`,
      );
    } else if (connectionType === "LOCAL") {
      console.log("💻 Connection Type: LOCAL MONGODB");
      console.log(`📊 Database: ${db.name}`);
      console.log(`📍 Host: ${db.host}`);
      console.log(`🔢 Port: ${db.port}`);
    } else {
      console.log("🔧 Connection Type: CUSTOM MONGODB");
      console.log(`📊 Database: ${db.name}`);
      console.log(`📍 Host: ${db.host}`);
      console.log(`🔢 Port: ${db.port}`);
    }

    console.log("═══════════════════════════════════\n");

    // Handle connection events with specific logging
    db.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    db.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      if (connectionType === "ATLAS_CLOUD") {
        console.log("🔄 Attempting to reconnect to MongoDB Atlas...");
      }
    });

    db.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected successfully");
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.log("\n💡 Troubleshooting tips:");
    console.log("  - For local MongoDB: Make sure MongoDB is running (mongod)");
    console.log(
      "  - For Atlas: Check your connection string and network access",
    );
    console.log("  - Verify your username/password are correct");
    console.log("  - Check if your IP is whitelisted in Atlas\n");
    process.exit(1);
  }
};

// Health check endpoint to see current connection status
app.get("/api/db-status", (req, res) => {
  const state = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  let connectionType = "unknown";
  const mongoURI =
    process.env.MONGO_URI || "mongodb://localhost:27017/bulkmailer";

  if (mongoURI.includes("mongodb+srv")) {
    connectionType = "MongoDB Atlas (Cloud)";
  } else if (mongoURI.includes("localhost") || mongoURI.includes("127.0.0.1")) {
    connectionType = "Local MongoDB";
  } else {
    connectionType = "Custom MongoDB";
  }

  res.json({
    status: states[state] || "unknown",
    connectionType: connectionType,
    database: mongoose.connection.name || "N/A",
    host: mongoose.connection.host || "N/A",
    port: mongoose.connection.port || "N/A",
    readyState: state,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(
      `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
    );
    console.log(`🔍 Health check: http://localhost:${PORT}/api/db-status\n`);
  });
};

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down gracefully...");
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
