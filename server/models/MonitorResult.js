const mongoose = require("mongoose");

const monitorResultSchema = new mongoose.Schema(
    {
        monitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Monitor", required: true, index: true },
        statusCode: { type: Number, default: null },
        responseTime: { type: Number, required: true },
        success: { type: Boolean, required: true },
        error: { type: String, default: null },
        checkedAt: { type: Date, default: Date.now, index: true }
    },
    { timestamps: false }
);

monitorResultSchema.index({ monitorId: 1, checkedAt: -1 });

module.exports = mongoose.model("MonitorResult", monitorResultSchema);
