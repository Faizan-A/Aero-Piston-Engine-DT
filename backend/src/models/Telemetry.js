const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date,
            default: Date.now,
        },

        rpm: Number,
        cht: Number,
        egt: Number,

        oil_pressure: Number,
        oil_temperature: Number,

        fuel_flow: Number,
        vibration: Number,

        battery_voltage: Number,
        injection_timing: Number,

        throttle: Number,
        fault: String,

        health_score: Number,
        mission_risk: String,

        ai: {
            anomaly_score: Number,
            status: String,
            detected_fault: String,
            health_score: Number,
            rul_hours: Number,
            confidence: Number,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Telemetry", telemetrySchema);