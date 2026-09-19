const Monitor = require("../models/Monitor");
const MonitorResult = require("../models/MonitorResult");
const Incident = require("../models/Incident");

const getHistory = async (req, res) => {
    const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const results = await MonitorResult.find({ monitorId: monitor._id })
        .sort({ checkedAt: -1 })
        .limit(limit);

    res.json(results);
};

const getAnalytics = async (req, res) => {
    const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const results = await MonitorResult.find({
        monitorId: monitor._id,
        checkedAt: { $gte: since }
    });

    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const availability = total ? (successful / total) * 100 : 0;
    const avgResponseTime = total
        ? results.reduce((sum, r) => sum + r.responseTime, 0) / total
        : 0;

    res.json({
        period: "24h",
        totalChecks: total,
        successfulChecks: successful,
        failedChecks: total - successful,
        availability: Number(availability.toFixed(2)),
        avgResponseTime: Math.round(avgResponseTime)
    });
};

const getDashboardAnalytics = async (req, res) => {
    const monitors = await Monitor.find({ user: req.user }).lean();
    const ids = monitors.map(m => m._id);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const results = await MonitorResult.find({
        monitorId: { $in: ids },
        checkedAt: { $gte: since }
    }).lean();

    const incidents = await Incident.find({
        user: req.user,
        status: "OPEN"
    }).countDocuments();

    const total = results.length;
    const successful = results.filter(r => r.success).length;

    res.json({
        totalMonitors: monitors.length,
        activeMonitors: monitors.filter(m => m.active).length,
        upMonitors: monitors.filter(m => m.lastStatus === "UP").length,
        downMonitors: monitors.filter(m => m.lastStatus === "DOWN").length,
        openIncidents: incidents,
        availability: total ? Number(((successful / total) * 100).toFixed(2)) : 0,
        avgResponseTime: total
            ? Math.round(results.reduce((s, r) => s + r.responseTime, 0) / total)
            : 0
    });
};

module.exports = { getHistory, getAnalytics, getDashboardAnalytics };
