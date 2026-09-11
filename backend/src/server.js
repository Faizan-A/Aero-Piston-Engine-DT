const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { getPrediction } = require("./services/aiService");
require("dotenv").config();
const telemetryRoutes = require("./routes/telemetry");

const connectDB = require("./config/db");
const Telemetry = require("./models/Telemetry");
const {
    startMission,
    stopMission,
    nextPhase,
    getMission,
} = require("./services/missionService");
const {
    updateEngineState,
    applyAIResult,
    getEngineState,
} = require("./services/digitalTwin");

connectDB();
const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use("/api/telemetry", telemetryRoutes);
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Aero Engine Digital Twin Backend Running",
        status: "online",
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "backend",
        timestamp: new Date().toISOString(),
    });
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("start_mission", () => {
    const mission = startMission();

    console.log("Mission started");

    updateEngineState({
        mission_phase: mission.phase,
    });
    io.emit("mission_update", mission);

});

socket.on("stop_mission", () => {
    const mission = stopMission();

    console.log("Mission stopped");

    updateEngineState({
        mission_phase: mission.phase,
    });
    io.emit("mission_update", mission);

});

socket.on("next_phase", () => {
    const mission = nextPhase();

    console.log("Mission phase:", mission.phase);
    updateEngineState({
        mission_phase: mission.phase,
    });

    io.emit("mission_update", mission);

});

    socket.on("telemetry", async (data) => {
    try {
        updateEngineState(data);

        const prediction = await getPrediction(data);

applyAIResult(prediction);

const engineState = {
    ...getEngineState(),
    ai: prediction,
};

        await Telemetry.create(engineState);

        io.emit("telemetry", engineState);
    } catch (error) {
        console.error("Telemetry processing error:", error.message);
    }
});

    socket.on("set_fault", (data) => {
    console.log("Fault command received:", data);

    io.emit("set_fault", data);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

app.get("/api/digital-twin", (req, res) => {
    res.json(getEngineState());
});
app.get("/api/mission", (req, res) => {
    res.json(getMission());
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});