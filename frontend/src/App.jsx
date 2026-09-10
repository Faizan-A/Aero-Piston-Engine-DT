import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const socket = io(import.meta.env.VITE_API_URL);

function App() {
    const [engine, setEngine] = useState(null);
    const [connected, setConnected] = useState(false);
    const [history, setHistory] = useState([]);
    const [mission, setMission] = useState({
    running: false,
    phase: "IDLE",
    phase_index: 0,
    total_phases: 8,
    throttle: 0,
});

    useEffect(() => {
    const loadHistory = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/telemetry?limit=30`
            );

            const data = await response.json();

            const historicalData = data.map((item) => ({
                time: new Date(item.timestamp).toLocaleTimeString(),
                rpm: item.rpm,
                cht: item.cht,
                egt: item.egt,
                vibration: item.vibration,
            }));

            setHistory(historicalData);

            if (data.length > 0) {
                setEngine(data[data.length - 1]);
            }
        } catch (error) {
            console.error(
                "Failed to load historical telemetry:",
                error
            );
        }
    };

    loadHistory();

    socket.on("connect", () => {
        setConnected(true);
    });

    socket.on("disconnect", () => {
        setConnected(false);
    });

    socket.on("telemetry", (data) => {
        setEngine(data);

        setHistory((previous) => {
            const point = {
                time: new Date().toLocaleTimeString(),
                rpm: data.rpm,
                cht: data.cht,
                egt: data.egt,
                vibration: data.vibration,
            };

            return [...previous, point].slice(-30);
        });
    });
    socket.on("mission_update", (data) => {
    setMission(data);
});

    return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("telemetry");
        socket.off("mission_update");
    };
}, []);

    const injectFault = (fault) => {
        socket.emit("set_fault", { fault });
    };

    if (!engine) {
        return (
            <div style={styles.page}>
                <h1>Aero Piston Engine Digital Twin</h1>
                <div style={styles.loading}>
                    Waiting for engine telemetry...
                </div>
            </div>
        );
    }

    const ai = engine.ai || {};

    return (
        <div style={styles.page}>

            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Aero Piston Engine Digital Twin
                    </h1>
                    <p style={styles.subtitle}>
                        Real-Time Health Monitoring & Fault Prediction
                    </p>
                </div>

                <div style={styles.connection}>
                    <span
                        style={{
                            ...styles.statusDot,
                            background: connected ? "#22c55e" : "#ef4444",
                        }}
                    />
                    {connected ? "SYSTEM ONLINE" : "DISCONNECTED"}
                </div>
            </div>

            {/* STATUS */}
            <div style={styles.sectionTitle}>
                ENGINE STATUS
            </div>

            <div style={styles.grid}>

                <Card
                    title="RPM"
                    value={engine.rpm}
                    unit="RPM"
                />

                <Card
                    title="Cylinder Head Temp"
                    value={engine.cht}
                    unit="°C"
                />

                <Card
                    title="Exhaust Gas Temp"
                    value={engine.egt}
                    unit="°C"
                />

                <Card
                    title="Oil Pressure"
                    value={engine.oil_pressure}
                    unit="PSI"
                />

                <Card
                    title="Oil Temperature"
                    value={engine.oil_temperature}
                    unit="°C"
                />

                <Card
                    title="Fuel Flow"
                    value={engine.fuel_flow}
                    unit="L/h"
                />

                <Card
                    title="Vibration"
                    value={engine.vibration}
                    unit="g"
                />

                <Card
                    title="Battery Voltage"
                    value={engine.battery_voltage}
                    unit="V"
                />

                <Card
                    title="Mission Phase"
                    value={engine.mission_phase || "IDLE"}
                    unit=""
                />

            </div>

            {/* AI SECTION */}
            <div style={styles.sectionTitle}>
                AI ENGINE HEALTH
            </div>

            <div style={styles.aiGrid}>

                <StatusCard
                    title="Health Score"
                    value={`${ai.health_score ?? engine.health_score}%`}
                />

                <StatusCard
                    title="Anomaly Score"
                    value={`${ai.anomaly_score ?? 0}%`}
                />

                <StatusCard
                    title="AI Status"
                    value={ai.status || "NORMAL"}
                />

                <StatusCard
                    title="Predicted Fault"
                    value={ai.detected_fault || "NONE"}
                />

                <StatusCard
                    title="Confidence"
                    value={`${Math.round(ai.confidence ?? 0)}%`}
                />

                <StatusCard
                    title="Estimated RUL"
                    value={`${ai.rul_hours ?? 1000} hrs`}
                />

            </div>

            <div style={styles.sectionTitle}>
    MISSION CONTROL
</div>

<div style={styles.missionBox}>

    <div style={styles.missionInfo}>

        <div>
            <span style={styles.label}>MISSION STATUS</span>
            <strong>
                {mission.running ? "RUNNING" : mission.phase}
            </strong>
        </div>

        <div>
            <span style={styles.label}>CURRENT PHASE</span>
            <strong>{mission.phase}</strong>
        </div>

        <div>
            <span style={styles.label}>PHASE</span>
            <strong>
                {mission.phase_index + 1} / {mission.total_phases}
            </strong>
        </div>

        <div>
            <span style={styles.label}>THROTTLE</span>
            <strong>
                {Math.round(mission.throttle * 100)}%
            </strong>
        </div>

    </div>

    <div style={styles.buttonContainer}>

        <button
            style={styles.startButton}
            onClick={() => socket.emit("start_mission")}
        >
            Start Mission
        </button>

        <button
            style={styles.phaseButton}
            onClick={() => socket.emit("next_phase")}
        >
            Next Phase
        </button>

        <button
            style={styles.stopButton}
            onClick={() => socket.emit("stop_mission")}
        >
            Stop Mission
        </button>

    </div>

</div>

            {/* FAULT INJECTION */}
            <div style={styles.sectionTitle}>
                FAULT INJECTION
            </div>

            <div style={styles.buttonContainer}>

                <button
                    style={styles.button}
                    onClick={() => injectFault("overheating")}
                >
                    Overheating
                </button>

                <button
                    style={styles.button}
                    onClick={() => injectFault("lubrication")}
                >
                    Lubrication Failure
                </button>

                <button
                    style={styles.button}
                    onClick={() => injectFault("vibration")}
                >
                    Abnormal Vibration
                </button>

                <button
                    style={styles.button}
                    onClick={() => injectFault("injector")}
                >
                    Injector Abnormality
                </button>

                <button
                    style={styles.button}
                    onClick={() => injectFault("misfire")}
                >
                    Misfire
                </button>

                <button
                    style={styles.clearButton}
                    onClick={() => injectFault("clear")}
                >
                    Clear Fault
                </button>

            </div>

            {/* ACTIVE FAULT */}
            <div style={styles.faultBox}>
                <strong>Active Fault:</strong>{" "}
                {engine.fault || "NONE"}
            </div>

            <div style={styles.recommendationBox}>
    <div style={styles.recommendationTitle}>
        AI MAINTENANCE RECOMMENDATION
    </div>

    <div style={styles.recommendationText}>
        {ai.recommendation || "Continue normal monitoring."}
    </div>
</div>

            {/* CHARTS */}
            <div style={styles.sectionTitle}>
                LIVE TELEMETRY
            </div>

            <div style={styles.chartGrid}>

                <Chart title="RPM">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="rpm"
                                dot={false}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Chart>

                <Chart title="CHT">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="cht"
                                dot={false}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Chart>

                <Chart title="EGT">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="egt"
                                dot={false}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Chart>

                <Chart title="Vibration">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="vibration"
                                dot={false}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Chart>

            </div>

        </div>
    );
}


function Card({ title, value, unit }) {
    return (
        <div style={styles.card}>
            <div style={styles.cardTitle}>
                {title}
            </div>

            <div style={styles.cardValue}>
                {value}
            </div>

            <div style={styles.unit}>
                {unit}
            </div>
        </div>
    );
}


function StatusCard({ title, value }) {
    return (
        <div style={styles.statusCard}>
            <div style={styles.cardTitle}>
                {title}
            </div>

            <div style={styles.statusValue}>
                {value}
            </div>
        </div>
    );
}


function Chart({ title, children }) {
    return (
        <div style={styles.chart}>
            <h3>{title}</h3>
            {children}
        </div>
    );
}


const styles = {

    missionBox: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "20px",
},

missionInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
},

label: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "8px",
},

startButton: {
    padding: "12px 18px",
    background: "#166534",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
},

phaseButton: {
    padding: "12px 18px",
    background: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
},

stopButton: {
    padding: "12px 18px",
    background: "#991b1b",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
},

    page: {
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f8fafc",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "35px",
    },

    title: {
        margin: 0,
        fontSize: "32px",
    },

    subtitle: {
        color: "#94a3b8",
        marginTop: "8px",
    },

    connection: {
        padding: "10px 16px",
        borderRadius: "8px",
        background: "#1e293b",
        fontWeight: "bold",
    },

    statusDot: {
        display: "inline-block",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        marginRight: "8px",
    },

    sectionTitle: {
        color: "#94a3b8",
        fontSize: "13px",
        fontWeight: "bold",
        letterSpacing: "1px",
        margin: "25px 0 12px",
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "15px",
    },

    card: {
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "12px",
        padding: "20px",
    },

    cardTitle: {
        color: "#94a3b8",
        fontSize: "14px",
    },

    cardValue: {
        fontSize: "28px",
        fontWeight: "bold",
        marginTop: "12px",
    },

    unit: {
        color: "#64748b",
        marginTop: "5px",
    },

    aiGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "15px",
    },

    statusCard: {
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "12px",
        padding: "20px",
    },

    statusValue: {
        fontSize: "22px",
        fontWeight: "bold",
        marginTop: "12px",
    },

    buttonContainer: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
    },

    button: {
        padding: "12px 18px",
        background: "#334155",
        color: "#f8fafc",
        border: "1px solid #475569",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
    },

    clearButton: {
        padding: "12px 18px",
        background: "#166534",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
    },

    faultBox: {
        marginTop: "15px",
        padding: "15px",
        background: "#1e293b",
        border: "1px solid #475569",
        borderRadius: "8px",
    },

    chartGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "20px",
    },

    chart: {
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "12px",
        padding: "20px",
    },

    loading: {
        padding: "30px",
        background: "#1e293b",
        borderRadius: "12px",
    },

    recommendationBox: {
    marginTop: "15px",
    padding: "20px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
},

recommendationTitle: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "1px",
},

recommendationText: {
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "bold",
},

};

export default App;