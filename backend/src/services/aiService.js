const axios = require("axios");

async function getPrediction(telemetry) {
    try {
        const response = await axios.post(
            `${process.env.AI_SERVICE_URL}/predict`,
            telemetry
        );

        return response.data;
    } catch (error) {
        console.error("AI service error:", error.message);

        return {
            anomaly_score: 0,
            status: "UNAVAILABLE",
            detected_fault: "NONE",
            health_score: 100,
            rul_hours: 1000,
            confidence: 0,
        };
    }
}

module.exports = {
    getPrediction,
};