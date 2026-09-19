const Incident = require("../models/Incident");
const Monitor = require("../models/Monitor");

const getIncidents = async (req, res) => {
    const incidents = await Incident.find({ user: req.user })
        .populate("monitorId", "name url")
        .sort({ createdAt: -1 });

    res.json(incidents);
};

const resolveIncident = async (req, res) => {
    const incident = await Incident.findOne({
        _id: req.params.id,
        user: req.user
    });

    if (!incident) return res.status(404).json({ message: "Incident not found" });

    incident.status = "RESOLVED";
    incident.resolvedAt = new Date();
    await incident.save();

    await Monitor.findByIdAndUpdate(incident.monitorId, { lastStatus: "UP" });

    res.json(incident);
};

module.exports = { getIncidents, resolveIncident };
