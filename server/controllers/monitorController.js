const { URL } = require("url");
const Monitor = require("../models/Monitor");
const MonitorResult = require("../models/MonitorResult");

const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const validateMonitor = (body) => {
    const { name, url, method, interval, timeout, expectedStatus } = body;

    if (!name || !url) return "Name and URL are required";

    try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return "Only HTTP and HTTPS URLs are allowed";
        }
    } catch {
        return "Invalid URL";
    }

    if (method && !allowedMethods.includes(method)) return "Invalid HTTP method";
    if (interval !== undefined && (Number(interval) < 5 || !Number.isFinite(Number(interval)))) {
        return "Interval must be at least 5 seconds";
    }
    if (timeout !== undefined && (Number(timeout) < 500 || !Number.isFinite(Number(timeout)))) {
        return "Timeout must be at least 500ms";
    }

    return null;
};

const createMonitor = async (req, res) => {
    try {
        const error = validateMonitor(req.body);
        if (error) return res.status(400).json({ message: error });

        const monitor = await Monitor.create({
            ...req.body,
            user: req.user
        });

        res.status(201).json(monitor);
    } catch (error) {
        res.status(500).json({ message: "Could not create monitor" });
    }
};

const getMonitors = async (req, res) => {
    const monitors = await Monitor.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(monitors);
};

const getMonitor = async (req, res) => {
    const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    res.json(monitor);
};

const updateMonitor = async (req, res) => {
    try {
        const error = validateMonitor(req.body);
        if (error) return res.status(400).json({ message: error });

        const monitor = await Monitor.findOneAndUpdate(
            { _id: req.params.id, user: req.user },
            req.body,
            { new: true, runValidators: true }
        );

        if (!monitor) return res.status(404).json({ message: "Monitor not found" });
        res.json(monitor);
    } catch {
        res.status(500).json({ message: "Could not update monitor" });
    }
};

const deleteMonitor = async (req, res) => {
    const monitor = await Monitor.findOneAndDelete({
        _id: req.params.id,
        user: req.user
    });

    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    await MonitorResult.deleteMany({ monitorId: monitor._id });
    res.json({ message: "Monitor deleted" });
};

module.exports = {
    createMonitor,
    getMonitors,
    getMonitor,
    updateMonitor,
    deleteMonitor
};
