import json
import random
import time
from datetime import datetime

import socketio


class EngineSimulator:
    def __init__(self):
        self.rpm = 2500
        self.cht = 150
        self.egt = 650
        self.oil_pressure = 45
        self.oil_temperature = 90
        self.fuel_flow = 18
        self.vibration = 2.0
        self.battery_voltage = 24
        self.injection_timing = 25

        self.throttle = 0.60
        self.fault = None

    def update(self):
        target_rpm = 1200 + self.throttle * 3000

        self.rpm += (target_rpm - self.rpm) * 0.1
        self.rpm += random.uniform(-30, 30)

        self.cht += ((110 + self.throttle * 90) - self.cht) * 0.05
        self.cht += random.uniform(-1.5, 1.5)

        self.egt += ((450 + self.throttle * 450) - self.egt) * 0.06
        self.egt += random.uniform(-8, 8)

        self.oil_pressure = 25 + (self.rpm / 4000) * 35
        self.oil_pressure += random.uniform(-1.5, 1.5)

        self.oil_temperature += (
            (70 + self.throttle * 45) - self.oil_temperature
        ) * 0.04
        self.oil_temperature += random.uniform(-1, 1)

        self.fuel_flow = 5 + self.throttle * 25
        self.fuel_flow += random.uniform(-0.5, 0.5)

        self.vibration = 1 + self.throttle * 2
        self.vibration += random.uniform(-0.2, 0.2)

        self.battery_voltage = 24 + random.uniform(-0.3, 0.3)

        self.injection_timing = 25 + random.uniform(-1, 1)

        self.apply_fault()

    def apply_fault(self):
        if self.fault == "overheating":
            self.cht += 25
            self.egt += 80

        elif self.fault == "lubrication":
            self.oil_pressure -= 15
            self.oil_temperature += 20

        elif self.fault == "vibration":
            self.vibration += 4

        elif self.fault == "injector":
            self.fuel_flow += 8
            self.injection_timing += 8

        elif self.fault == "misfire":
            self.rpm -= 250
            self.egt -= 100
            self.vibration += 3

    def get_telemetry(self):
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "rpm": round(self.rpm, 2),
            "cht": round(self.cht, 2),
            "egt": round(self.egt, 2),
            "oil_pressure": round(self.oil_pressure, 2),
            "oil_temperature": round(self.oil_temperature, 2),
            "fuel_flow": round(self.fuel_flow, 2),
            "vibration": round(self.vibration, 2),
            "battery_voltage": round(self.battery_voltage, 2),
            "injection_timing": round(self.injection_timing, 2),
            "throttle": round(self.throttle, 2),
            "fault": self.fault,
        }

    def set_fault(self, fault):
        self.fault = fault
        print(f"Simulator fault set to: {fault}")

    def clear_fault(self):
        self.fault = None
        print("Simulator fault cleared")


engine = EngineSimulator()

sio = socketio.Client()


@sio.event
def connect():
    print("Connected to Digital Twin Backend")


@sio.event
def disconnect():
    print("Disconnected from Backend")


@sio.on("set_fault")
def receive_fault(data):
    fault = data.get("fault")

    if fault == "clear":
        engine.clear_fault()
    else:
        engine.set_fault(fault)


@sio.on("mission_update")
def receive_mission(data):
    throttle = data.get("throttle")

    if throttle is not None:
        engine.throttle = float(throttle)

        print(
            f"Mission phase: {data.get('phase')} | "
            f"Throttle: {engine.throttle * 100:.0f}%"
        )

if __name__ == "__main__":

    print("Aero Piston Engine Simulator Started")
    print("Connecting to backend...")

    try:
        sio.connect("http://localhost:5000")

        while True:
            engine.update()

            telemetry = engine.get_telemetry()

            sio.emit("telemetry", telemetry)

            print(json.dumps(telemetry))

            time.sleep(1)

    except KeyboardInterrupt:
        print("\nSimulator stopped.")

    except Exception as error:
        print(f"Error: {error}")

    finally:
        if sio.connected:
            sio.disconnect()