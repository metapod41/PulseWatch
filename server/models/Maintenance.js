const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
    {
        monitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Monitor", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, trim: true },
        startsAt: { type: Date, required: true },
        endsAt: { type: Date, required: true },
        status: { type: String, enum: ["SCHEDULED", "ACTIVE", "COMPLETED"], default: "SCHEDULED" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);
