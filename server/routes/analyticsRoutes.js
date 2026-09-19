const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    getHistory,
    getAnalytics,
    getDashboardAnalytics
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/dashboard", protect, getDashboardAnalytics);
router.get("/:id/history", protect, getHistory);
router.get("/:id/analytics", protect, getAnalytics);

module.exports = router;
