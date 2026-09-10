const express = require("express");
const Telemetry = require("../models/Telemetry");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const limit = Math.min(
            parseInt(req.query.limit) || 100,
            1000
        );

        const telemetry = await Telemetry.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json(telemetry.reverse());
    } catch (error) {
        console.error("Telemetry fetch error:", error.message);

        res.status(500).json({
            error: "Failed to fetch telemetry",
        });
    }
});

router.get("/latest", async (req, res) => {
    try {
        const latest = await Telemetry.findOne()
            .sort({ createdAt: -1 })
            .lean();

        res.json(latest);
    } catch (error) {
        console.error("Latest telemetry error:", error.message);

        res.status(500).json({
            error: "Failed to fetch latest telemetry",
        });
    }
});

module.exports = router;