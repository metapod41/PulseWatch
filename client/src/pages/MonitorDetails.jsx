import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import api from "../api";

export default function MonitorDetails() {
    const { id } = useParams();
    const [monitor, setMonitor] = useState(null);
    const [history, setHistory] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    const load = async () => {
        const [m, h, a] = await Promise.all([
            api.get(`/monitors/${id}`),
            api.get(`/analytics/${id}/history?limit=100`),
            api.get(`/analytics/${id}/analytics`)
        ]);
        setMonitor(m.data);
        setHistory(h.data);
        setAnalytics(a.data);
    };

    useEffect(() => {
        load();
        const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
        const refresh = (payload) => {
            if (payload?.monitorId === id) load();
        };
        socket.on("monitor:result", refresh);
        return () => socket.disconnect();
    }, [id]);

    if (!monitor) return <p>Loading...</p>;

    return (
        <div>
            <h1>{monitor.name}</h1>
            <p>{monitor.method} {monitor.url}</p>

            <div className="grid stats">
                <div className="card"><span>Availability</span><strong>{analytics?.availability}%</strong></div>
                <div className="card"><span>Avg response</span><strong>{analytics?.avgResponseTime}ms</strong></div>
                <div className="card"><span>Checks</span><strong>{analytics?.totalChecks}</strong></div>
                <div className="card"><span>Failures</span><strong>{analytics?.failedChecks}</strong></div>
            </div>

            <div className="card">
                <h2>Recent checks</h2>
                <div className="tablewrap">
                    <table>
                        <thead><tr><th>Time</th><th>Status</th><th>HTTP</th><th>Response</th><th>Error</th></tr></thead>
                        <tbody>
                            {history.map(r => (
                                <tr key={r._id}>
                                    <td>{new Date(r.checkedAt).toLocaleString()}</td>
                                    <td><span className={`badge ${r.success ? "up" : "down"}`}>{r.success ? "UP" : "DOWN"}</span></td>
                                    <td>{r.statusCode || "-"}</td>
                                    <td>{r.responseTime}ms</td>
                                    <td>{r.error || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
