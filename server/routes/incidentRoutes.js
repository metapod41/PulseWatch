const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getIncidents, resolveIncident } = require("../controllers/incidentController");

const router = express.Router();

router.get("/", protect, getIncidents);
router.put("/:id/resolve", protect, resolveIncident);

module.exports = router;
