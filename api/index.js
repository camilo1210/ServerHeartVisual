const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./database/database");
const UserDAO = require("./dao/UserDAO");

connectDB();

//load enviroment variables
dotenv.config();


//create express app
const app = express();

//middlewares
app.use(express.json()); //parse json requests
app.use(cors({ //enable cors with configuration
    origin: true,   //Allow all origins (restrict in production)
    credentials: true   //Allow credentials (cookies, authorization headers)
}));

//Health check endpoint
app.get("/", (req, res) => {
    res.send("Serer is running");
});


// Instantiate UserDAO
const userDAO = new UserDAO();

//Routes for user
app.get("/api/v1/users/", (req, res) => userDAO.getAll(req, res));
app.post("/api/v1/users/", (req, res) => userDAO.create(req, res));
app.get("/api/v1/users/:id", (req, res) => userDAO.getById(req, res));
app.put("/api/v1/users/:id", (req, res) => userDAO.update(req, res));
app.delete("/api/v1/users/:id", (req, res) => userDAO.delete(req, res));

//Config port
const PORT = process.env.PORT || 3000;

//Start server
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
