let mission = {
    running: false,
    phase: "IDLE",
    phase_index: 0,
    total_phases: 8,
    throttle: 0,
};

const phases = [
    {
        name: "TAKEOFF",
        throttle: 0.8,
    },
    {
        name: "CLIMB",
        throttle: 0.7,
    },
    {
        name: "CRUISE",
        throttle: 0.55,
    },
    {
        name: "HIGH ALTITUDE",
        throttle: 0.65,
    },
    {
        name: "RAPID THROTTLE",
        throttle: 0.9,
    },
    {
        name: "ENDURANCE",
        throttle: 0.6,
    },
    {
        name: "DESCENT",
        throttle: 0.4,
    },
    {
        name: "LANDING",
        throttle: 0.25,
    },
];

function startMission() {
    mission = {
        running: true,
        phase: phases[0].name,
        phase_index: 0,
        total_phases: phases.length,
        throttle: phases[0].throttle,
    };

    return mission;
}

function stopMission() {
    mission.running = false;
    mission.phase = "IDLE";
    mission.throttle = 0;

    return mission;
}

function nextPhase() {
    if (mission.phase_index < phases.length - 1) {
        mission.phase_index++;

        const phase = phases[mission.phase_index];

        mission.phase = phase.name;
        mission.throttle = phase.throttle;
    } else {
        mission.running = false;
        mission.phase = "COMPLETED";
        mission.throttle = 0;
    }

    return mission;
}

function getMission() {
    return mission;
}

module.exports = {
    startMission,
    stopMission,
    nextPhase,
    getMission,
};