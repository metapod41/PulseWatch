const express = require("express");
const Monitor = require("../models/Monitor");
const MonitorResult = require("../models/MonitorResult");

const router = express.Router();

router.get("/:userId", async (req, res) => {
    const monitors = await Monitor.find({ user: req.params.userId })
        .select("name url lastStatus lastCheckedAt active");

    const data = await Promise.all(
        monitors.map(async (monitor) => {
            const results = await MonitorResult.find({ monitorId: monitor._id })
                .sort({ checkedAt: -1 })
                .limit(30)
                .select("success responseTime checkedAt statusCode");

            return {
                id: monitor._id,
                name: monitor.name,
                url: monitor.url,
                status: monitor.active ? monitor.lastStatus : "PAUSED",
                lastCheckedAt: monitor.lastCheckedAt,
                recentResults: results
            };
        })
    );

    res.json({
        service: "PulseWatch",
        generatedAt: new Date(),
        monitors: data
    });
});

module.exports = router;
