const Maintenance = require("../models/Maintenance");
const Monitor = require("../models/Monitor");

const refreshStatus = (m) => {
    const now = Date.now();
    if (new Date(m.endsAt).getTime() <= now) m.status = "COMPLETED";
    else if (new Date(m.startsAt).getTime() <= now) m.status = "ACTIVE";
    else m.status = "SCHEDULED";
};

const getMaintenance = async (req, res) => {
    const items = await Maintenance.find({ user: req.user })
        .populate("monitorId", "name")
        .sort({ startsAt: 1 });

    for (const item of items) {
        refreshStatus(item);
        await item.save();
    }

    res.json(items);
};

const createMaintenance = async (req, res) => {
    const { monitorId, title, startsAt, endsAt } = req.body;

    const monitor = await Monitor.findOne({ _id: monitorId, user: req.user });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    if (!title || !startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) {
        return res.status(400).json({ message: "Valid title, start and end times are required" });
    }

    const item = await Maintenance.create({
        monitorId,
        user: req.user,
        title,
        startsAt,
        endsAt
    });

    res.status(201).json(item);
};

const deleteMaintenance = async (req, res) => {
    const item = await Maintenance.findOneAndDelete({
        _id: req.params.id,
        user: req.user
    });

    if (!item) return res.status(404).json({ message: "Maintenance not found" });
    res.json({ message: "Maintenance deleted" });
};

module.exports = { getMaintenance, createMaintenance, deleteMaintenance };
