require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin123",
    database: "co Olabs"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

// User Signup
app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
    db.query(sql, [email, hashedPassword], (err, result) => {
        if (err) {
            res.status(400).json({ error: "Email already exists!" });
        } else {
            res.status(201).json({ message: "User registered successfully!" });
        }
    });
});

// User Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(400).json({ error: "User not found!" });
        }
        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials!" });
        }

        const token = jwt.sign({ id: user.id }, "secretKey", { expiresIn: "1h" });
        res.json({ message: "Login successful!", token });
    });
});

// Socket.io Chat Handling
io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("user-joined", (data) => {
        socket.join(`${data.userClass}-${data.userStream}-${data.topic}`);
        console.log(`${data.username} joined ${data.userClass} - ${data.userStream} - ${data.topic}`);
    });

    socket.on("chat-message", (data) => {
        console.log("Message received:", data);
        io.to(`${data.userClass}-${data.userStream}-${data.topic}`).emit("chat-message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
    });
});

// Start Server
server.listen(5000, () => {
    console.log("Server running on port 5000...");
});
