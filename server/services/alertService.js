const nodemailer = require("nodemailer");

const canEmail = () =>
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.ALERT_FROM;

const sendIncidentEmail = async ({ to, monitor, incident, resolved }) => {
    if (!canEmail() || !to) {
        console.log(`[Alert] Email skipped for ${monitor.name} (${resolved ? "resolved" : "opened"})`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.ALERT_FROM,
        to,
        subject: resolved
            ? `RESOLVED: ${monitor.name}`
            : `INCIDENT: ${monitor.name} is down`,
        text: resolved
            ? `${monitor.name} is back up.`
            : `${monitor.name} is down.\nReason: ${incident.reason}`
    });
};

module.exports = { sendIncidentEmail };
