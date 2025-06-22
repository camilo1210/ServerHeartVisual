const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./database/database");
const UserDAO = require("./dao/UserDAO");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// === Usuarios ===
const userDAO = new UserDAO();
app.get("/api/v1/users/", (req, res) => userDAO.getAll(req, res));
app.post("/api/v1/users/", (req, res) => userDAO.create(req, res));
app.get("/api/v1/users/:id", (req, res) => userDAO.getById(req, res));
app.put("/api/v1/users/:id", (req, res) => userDAO.update(req, res));
app.delete("/api/v1/users/:id", (req, res) => userDAO.delete(req, res));

// === Quiz ===
const resultadoSchema = new mongoose.Schema({
  displayName: String,
  email: String,
  score: Number,
  totalQuestions: Number,
  date: { type: Date, default: Date.now },
});
const Resultado = mongoose.model("Resultado", resultadoSchema);

app.post("/quiz/save-score", async (req, res) => {
  const { displayName, email, score, totalQuestions } = req.body;
  if (!email || score == null || !totalQuestions) {
    return res.status(400).json({ message: "Datos incompletos" });
  }
  try {
    const nuevoResultado = new Resultado({ displayName, email, score, totalQuestions });
    await nuevoResultado.save();
    res.status(200).json({ message: "Puntuación guardada con éxito" });
  } catch (error) {
    console.error("Error al guardar resultado:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

app.get("/quiz/scores", async (req, res) => {
  try {
    const topScores = await Resultado.find().sort({ score: -1, date: 1 }).limit(10);
    res.status(200).json(topScores);
  } catch (err) {
    res.status(500).json({ message: "Error del servidor" });
  }
});

app.get("/quiz/results", async (req, res) => {
  try {
    const resultados = await Resultado.find().sort({ date: -1 }).limit(50);
    res.status(200).json(resultados);
  } catch (err) {
    res.status(500).json({ message: "Error del servidor" });
  }
});

app.get("/quiz/top", async (req, res) => {
  try {
    const topResultados = await Resultado.find().sort({ score: -1, date: 1 }).limit(3);
    res.status(200).json(topResultados);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
});

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("🚀 Backend combinado corriendo");
});

// 🚀 Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
