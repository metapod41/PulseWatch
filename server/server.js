const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const monitorRoutes = require("./routes/monitorRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const statusRoutes = require("./routes/statusRoutes");
const { startMonitoring, setSocketIO } = require("./services/monitoringService");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173"
    }
});

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({ message: "PulseWatch API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/monitors", monitorRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/status", statusRoutes);

io.on("connection", (socket) => {
    console.log("Realtime client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("Realtime client disconnected:", socket.id);
    });
});

setSocketIO(io);

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        startMonitoring();
    });
};

start();
