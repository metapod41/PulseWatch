const cron = require("node-cron");
const { URL } = require("url");

const Monitor = require("../models/Monitor");
const MonitorResult = require("../models/MonitorResult");
const Incident = require("../models/Incident");
const User = require("../models/User");
const Maintenance = require("../models/Maintenance");
const { sendIncidentEmail } = require("./alertService");

let io = null;

const setSocketIO = (socketIO) => {
    io = socketIO;
};

const getJsonPath = (object, path) => {
    if (!path) return undefined;
    return path.split(".").reduce((current, key) => {
        if (current === undefined || current === null) return undefined;
        return current[key];
    }, object);
};

const isInMaintenance = async (monitorId) => {
    const now = new Date();
    const maintenance = await Maintenance.findOne({
        monitorId,
        startsAt: { $lte: now },
        endsAt: { $gte: now }
    });
    return !!maintenance;
};

const checkMonitor = async (monitor) => {
    const startTime = Date.now();
    let statusCode = null;
    let success = false;
    let errorMessage = null;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), monitor.timeout);

        const headers = {};
        if (monitor.requestHeaders) {
            for (const [key, value] of Object.entries(monitor.requestHeaders.toObject?.() || monitor.requestHeaders)) {
                headers[key] = value;
            }
        }

        const options = {
            method: monitor.method,
            signal: controller.signal,
            headers
        };

        if (monitor.method !== "GET" && monitor.method !== "DELETE" && monitor.requestBody) {
            options.body = monitor.requestBody;
            if (!headers["Content-Type"] && !headers["content-type"]) {
                headers["Content-Type"] = "application/json";
            }
        }

        const response = await fetch(monitor.url, options);
        clearTimeout(timeoutId);

        statusCode = response.status;
        const text = await response.text();

        success = statusCode === monitor.expectedStatus;

        if (success && monitor.responseContains) {
            success = text.includes(monitor.responseContains);
            if (!success) errorMessage = "Response text validation failed";
        }

        if (success && monitor.responseJsonPath) {
            try {
                const json = JSON.parse(text);
                const actual = getJsonPath(json, monitor.responseJsonPath);
                if (String(actual) !== String(monitor.responseJsonValue)) {
                    success = false;
                    errorMessage = "JSON response validation failed";
                }
            } catch {
                success = false;
                errorMessage = "Response is not valid JSON";
            }
        }
    } catch (error) {
        errorMessage = error.name === "AbortError"
            ? "Request timed out"
            : error.message;
    }

    const responseTime = Date.now() - startTime;
    const wasMaintenance = await isInMaintenance(monitor._id);

    const result = await MonitorResult.create({
        monitorId: monitor._id,
        statusCode,
        responseTime,
        success: wasMaintenance ? true : success,
        error: wasMaintenance ? "Maintenance window" : errorMessage,
        checkedAt: new Date()
    });

    await Monitor.findByIdAndUpdate(monitor._id, {
        lastCheckedAt: new Date(),
        lastStatus: wasMaintenance ? "UP" : (success ? "UP" : "DOWN")
    });

    if (!wasMaintenance) {
        await processIncident(monitor, success, errorMessage);
    }

    if (io) {
        io.emit("monitor:result", {
            monitorId: monitor._id.toString(),
            result: {
                statusCode,
                responseTime,
                success: wasMaintenance ? true : success,
                error: wasMaintenance ? "Maintenance window" : errorMessage,
                checkedAt: result.checkedAt
            }
        });
    }

    console.log(
        `[Monitor] ${monitor.name} | ${success ? "UP" : "DOWN"} | ${statusCode || "ERROR"} | ${responseTime}ms`
    );
};

const processIncident = async (monitor, success, errorMessage) => {
    const openIncident = await Incident.findOne({
        monitorId: monitor._id,
        status: "OPEN"
    });

    if (!success && !openIncident) {
        const incident = await Incident.create({
            monitorId: monitor._id,
            user: monitor.user,
            reason: errorMessage || `Expected status ${monitor.expectedStatus}`,
            failureCount: 1
        });

        const user = await User.findById(monitor.user);
        await sendIncidentEmail({
            to: user?.email,
            monitor,
            incident,
            resolved: false
        });

        if (io) {
            io.emit("incident:opened", {
                monitorId: monitor._id.toString(),
                incident
            });
        }
    } else if (!success && openIncident) {
        openIncident.failureCount += 1;
        await openIncident.save();
    } else if (success && openIncident) {
        openIncident.status = "RESOLVED";
        openIncident.resolvedAt = new Date();
        await openIncident.save();

        const user = await User.findById(monitor.user);
        await sendIncidentEmail({
            to: user?.email,
            monitor,
            incident: openIncident,
            resolved: true
        });

        if (io) {
            io.emit("incident:resolved", {
                monitorId: monitor._id.toString(),
                incident: openIncident
            });
        }
    }
};

const runMonitoringCycle = async () => {
    const monitors = await Monitor.find({ active: true });
    const now = Date.now();

    for (const monitor of monitors) {
        if (!monitor.lastCheckedAt ||
            now - new Date(monitor.lastCheckedAt).getTime() >= monitor.interval * 1000) {
            try {
                await checkMonitor(monitor);
            } catch (error) {
                console.error(`Monitor ${monitor._id} failed:`, error.message);
            }
        }
    }
};

const startMonitoring = () => {
    console.log("Monitoring engine started");
    cron.schedule("*/5 * * * * *", runMonitoringCycle);
};

module.exports = { startMonitoring, setSocketIO, runMonitoringCycle };
