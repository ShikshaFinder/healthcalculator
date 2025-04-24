const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/bmi-calculator", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// BMI Schema
const bmiSchema = new mongoose.Schema({
  bmi: String,
  category: String,
  weight: Number,
  height: Number,
  createdAt: { type: Date, default: Date.now },
});

const BMIModel = mongoose.model("BMI", bmiSchema);

// Routes
app.post("/api/bmi", async (req, res) => {
  try {
    const { bmi, category, weight, height } = req.body;
    const newBMI = new BMIModel({
      bmi,
      category,
      weight,
      height,
    });
    await newBMI.save();
    res.status(201).json(newBMI);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/bmi", async (req, res) => {
  try {
    const bmiRecords = await BMIModel.find().sort({ createdAt: -1 });
    res.json(bmiRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
