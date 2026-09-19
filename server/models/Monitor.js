const mongoose = require("mongoose");

const monitorSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
        method: {
            type: String,
            enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            default: "GET"
        },
        interval: { type: Number, required: true, default: 60, min: 5 },
        timeout: { type: Number, required: true, default: 5000, min: 500 },
        expectedStatus: { type: Number, required: true, default: 200, min: 100, max: 599 },
        active: { type: Boolean, default: true },
        requestHeaders: { type: Map, of: String, default: {} },
        requestBody: { type: String, default: "" },
        responseContains: { type: String, default: "" },
        responseJsonPath: { type: String, default: "" },
        responseJsonValue: { type: String, default: "" },
        lastCheckedAt: { type: Date, default: null },
        lastStatus: {
            type: String,
            enum: ["UP", "DOWN", "UNKNOWN"],
            default: "UNKNOWN"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Monitor", monitorSchema);
