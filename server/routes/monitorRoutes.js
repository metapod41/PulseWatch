const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    createMonitor,
    getMonitors,
    getMonitor,
    updateMonitor,
    deleteMonitor
} = require("../controllers/monitorController");

const router = express.Router();

router.post("/", protect, createMonitor);
router.get("/", protect, getMonitors);
router.get("/:id", protect, getMonitor);
router.put("/:id", protect, updateMonitor);
router.delete("/:id", protect, deleteMonitor);

module.exports = router;
