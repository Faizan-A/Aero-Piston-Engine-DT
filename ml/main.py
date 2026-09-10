from fastapi import FastAPI
import numpy as np

app = FastAPI(title="Aero Engine AI Service")


@app.get("/")
def root():
    return {
        "service": "Aero Engine AI Service",
        "status": "online"
    }


@app.post("/predict")
def predict(data: dict):

    cht = float(data.get("cht", 0))
    egt = float(data.get("egt", 0))
    oil_pressure = float(data.get("oil_pressure", 0))
    oil_temperature = float(data.get("oil_temperature", 0))
    vibration = float(data.get("vibration", 0))
    rpm = float(data.get("rpm", 0))

    anomaly_score = 0
    detected_fault = "NONE"

    if cht > 190:
        anomaly_score += 30
        detected_fault = "OVERHEATING"

    if egt > 850:
        anomaly_score += 25
        detected_fault = "COMBUSTION / OVERHEATING"

    if oil_pressure < 30:
        anomaly_score += 30
        detected_fault = "LUBRICATION FAILURE"

    if oil_temperature > 115:
        anomaly_score += 15
        detected_fault = "OIL OVERHEATING"

    if vibration > 4:
        anomaly_score += 25
        detected_fault = "ABNORMAL VIBRATION"

    if rpm < 1800:
        anomaly_score += 15
        detected_fault = "MISFIRE"

    anomaly_score = min(anomaly_score, 100)

    if anomaly_score >= 60:
        status = "CRITICAL"
    elif anomaly_score >= 30:
        status = "WARNING"
    else:
        status = "NORMAL"

    health_score = max(0, 100 - anomaly_score)

    rul_hours = max(
        1,
        round(1000 * (health_score / 100), 1)
    )
    
    if detected_fault == "OVERHEATING":
        recommendation = (
            "Inspect cooling system and monitor CHT/EGT."
        )

    elif detected_fault == "COMBUSTION / OVERHEATING":
        recommendation = (
            "Inspect combustion system, cooling and ignition."
        )

    elif detected_fault == "LUBRICATION FAILURE":
        recommendation = (
            "Inspect oil level, oil pump and lubrication system."
        )

    elif detected_fault == "OIL OVERHEATING":
        recommendation = (
            "Inspect oil cooling system and oil temperature."
        )

    elif detected_fault == "ABNORMAL VIBRATION":
        recommendation = (
            "Inspect propeller, engine mounts and rotating components."
        )

    elif detected_fault == "MISFIRE":
        recommendation = (
            "Inspect spark ignition, injector and combustion system."
        )

    else:
        recommendation = (
            "Continue normal monitoring."
        )

    return {
        "anomaly_score": anomaly_score,
        "status": status,
        "detected_fault": detected_fault,
        "health_score": health_score,
        "rul_hours": rul_hours,
        "confidence": min(99, 70 + anomaly_score / 3),
        "recommendation": recommendation,
    }