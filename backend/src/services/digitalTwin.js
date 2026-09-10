let engineState = {
    timestamp: null,

    rpm: 0,
    cht: 0,
    egt: 0,

    oil_pressure: 0,
    oil_temperature: 0,

    fuel_flow: 0,
    vibration: 0,

    battery_voltage: 0,
    injection_timing: 0,

    throttle: 0,

    fault: null,

    health_score: 100,
    mission_risk: "LOW",
    mission_phase: "IDLE",
};

function updateEngineState(telemetry) {
    engineState = {
        ...engineState,
        ...telemetry,
    };

    calculateHealth();
}

function calculateHealth() {
    let health = 100;

    if (engineState.cht > 190) {
        health -= 15;
    }

    if (engineState.egt > 850) {
        health -= 15;
    }

    if (engineState.oil_pressure < 30) {
        health -= 20;
    }

    if (engineState.oil_temperature > 115) {
        health -= 10;
    }

    if (engineState.vibration > 4) {
        health -= 15;
    }

    if (engineState.battery_voltage < 22) {
        health -= 10;
    }

    if (engineState.fault) {
        health -= 10;
    }

    engineState.health_score = Math.max(
        0,
        Math.round(health)
    );

    updateMissionRisk();
}

function updateMissionRisk() {
    if (engineState.health_score < 60) {
        engineState.mission_risk = "HIGH";
    } else if (engineState.health_score < 80) {
        engineState.mission_risk = "MEDIUM";
    } else {
        engineState.mission_risk = "LOW";
    }
}

function applyAIResult(ai) {
    if (!ai) {
        return;
    }

    if (ai.health_score < engineState.health_score) {
        engineState.health_score = ai.health_score;
    }

    if (ai.status === "CRITICAL") {
        engineState.mission_risk = "HIGH";
    } else if (
        ai.status === "WARNING" &&
        engineState.mission_risk !== "HIGH"
    ) {
        engineState.mission_risk = "MEDIUM";
    }
}

function getEngineState() {
    return engineState;
}

module.exports = {
    updateEngineState,
    applyAIResult,
    getEngineState,
};