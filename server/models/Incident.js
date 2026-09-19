const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
    {
        monitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Monitor", required: true, index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        startedAt: { type: Date, required: true, default: Date.now },
        resolvedAt: { type: Date, default: null },
        status: { type: String, enum: ["OPEN", "RESOLVED"], default: "OPEN" },
        reason: { type: String, default: "Monitor check failed" },
        failureCount: { type: Number, default: 1 }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Incident", incidentSchema);
