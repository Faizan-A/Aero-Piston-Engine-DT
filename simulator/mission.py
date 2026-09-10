import time

MISSION_PHASES = [
    {
        "name": "TAKEOFF",
        "duration": 20,
        "throttle": 0.80,
    },
    {
        "name": "CLIMB",
        "duration": 30,
        "throttle": 0.70,
    },
    {
        "name": "CRUISE",
        "duration": 60,
        "throttle": 0.55,
    },
    {
        "name": "HIGH ALTITUDE",
        "duration": 45,
        "throttle": 0.65,
    },
    {
        "name": "RAPID THROTTLE",
        "duration": 30,
        "throttle": 0.90,
    },
    {
        "name": "ENDURANCE",
        "duration": 60,
        "throttle": 0.60,
    },
    {
        "name": "DESCENT",
        "duration": 30,
        "throttle": 0.40,
    },
    {
        "name": "LANDING",
        "duration": 20,
        "throttle": 0.25,
    },
]


class MissionSimulator:

    def __init__(self):
        self.current_phase = "IDLE"
        self.phase_index = 0
        self.mission_running = False

    def start(self):
        self.mission_running = True
        self.phase_index = 0

    def stop(self):
        self.mission_running = False
        self.current_phase = "IDLE"

    def get_current_phase(self):
        if not self.mission_running:
            return None

        return MISSION_PHASES[self.phase_index]

    def next_phase(self):
        if self.phase_index < len(MISSION_PHASES) - 1:
            self.phase_index += 1
        else:
            self.mission_running = False
            self.current_phase = "COMPLETED"

    def get_status(self):
        if not self.mission_running:
            return {
                "running": False,
                "phase": self.current_phase,
            }

        phase = self.get_current_phase()

        self.current_phase = phase["name"]

        return {
            "running": True,
            "phase": phase["name"],
            "throttle": phase["throttle"],
            "duration": phase["duration"],
            "phase_index": self.phase_index,
            "total_phases": len(MISSION_PHASES),
        }


if __name__ == "__main__":

    mission = MissionSimulator()
    mission.start()

    print("Mission simulation started")

    while mission.mission_running:

        status = mission.get_status()

        print(status)

        time.sleep(status["duration"])

        mission.next_phase()

    print("Mission completed")