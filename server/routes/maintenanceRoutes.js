const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    getMaintenance,
    createMaintenance,
    deleteMaintenance
} = require("../controllers/maintenanceController");

const router = express.Router();

router.get("/", protect, getMaintenance);
router.post("/", protect, createMaintenance);
router.delete("/:id", protect, deleteMaintenance);

module.exports = router;
