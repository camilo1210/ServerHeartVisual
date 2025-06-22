import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión a MongoDB", err));

// Esquema del resultado del quiz
const resultadoSchema = new mongoose.Schema({
  displayName: String,
  email: String,
  score: Number,
  totalQuestions: Number,
  date: { type: Date, default: Date.now },
});

const Resultado = mongoose.model("Resultado", resultadoSchema);

// Ruta para guardar el resultado del quiz
app.post("/quiz/save-score", async (req, res) => {
  console.log("📥 Datos recibidos:", req.body);
  const { displayName, email, score, totalQuestions } = req.body;

  if (!email || score == null || !totalQuestions) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  try {
    const nuevoResultado = new Resultado({
      displayName,
      email,
      score,
      totalQuestions,
    });

    await nuevoResultado.save();
    console.log("✅ Resultado guardado:", nuevoResultado);
    res.status(200).json({ message: "Puntuación guardada con éxito" });
  } catch (error) {
    console.error("Error al guardar el resultado:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Ruta para obtener el TOP 10 de puntuaciones
app.get("/quiz/scores", async (req, res) => {
  console.log("📩 Datos recibidos en /quiz/save-score:", req.body);
  try {
    const topScores = await Resultado.find()
      .sort({ score: -1, date: 1 }) // Mayor puntaje, más reciente en caso de empate
      .limit(10);

    res.status(200).json(topScores);
  } catch (err) {
    console.error("Error al obtener top puntuaciones:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Backend del Quiz corriendo");
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("🚀 Backend del Quiz corriendo");
});


app.get("/quiz/results", async (req, res) => {
  try {
    const resultados = await Resultado.find().sort({ date: -1 }).limit(50);
    res.status(200).json(resultados);
  } catch (err) {
    console.error("Error al obtener resultados:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Obtener los 3 mejores puntajes
app.get("/quiz/top", async (req, res) => {
  try {
    const topResultados = await Resultado.find()
      .sort({ score: -1, date: 1 }) // Primero más puntaje, luego más reciente
      .limit(3);

    res.status(200).json(topResultados);
  } catch (error) {
    console.error("Error al obtener top:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

