import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [monitors, setMonitors] = useState([]);

    const load = async () => {
        const [s, m] = await Promise.all([
            api.get("/analytics/dashboard"),
            api.get("/monitors")
        ]);
        setStats(s.data);
        setMonitors(m.data);
    };

    useEffect(() => {
        load();
        const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
        socket.on("monitor:result", load);
        socket.on("incident:opened", load);
        socket.on("incident:resolved", load);
        return () => socket.disconnect();
    }, []);

    return (
        <div>
            <div className="pagehead">
                <div>
                    <h1>Dashboard</h1>
                    <p>Live health of your monitored APIs.</p>
                </div>
                <Link className="primary btn" to="/monitors">Manage monitors</Link>
            </div>

            <div className="grid stats">
                <div className="card"><span>Monitors</span><strong>{stats?.totalMonitors ?? "-"}</strong></div>
                <div className="card"><span>Up</span><strong>{stats?.upMonitors ?? "-"}</strong></div>
                <div className="card"><span>Down</span><strong>{stats?.downMonitors ?? "-"}</strong></div>
                <div className="card"><span>Open incidents</span><strong>{stats?.openIncidents ?? "-"}</strong></div>
                <div className="card"><span>24h availability</span><strong>{stats?.availability ?? 0}%</strong></div>
                <div className="card"><span>Avg response</span><strong>{stats?.avgResponseTime ?? 0}ms</strong></div>
            </div>

            <h2>Monitors</h2>
            <div className="grid">
                {monitors.map(m => (
                    <Link className="card monitor" to={`/monitors/${m._id}`} key={m._id}>
                        <div>
                            <h3>{m.name}</h3>
                            <p>{m.url}</p>
                        </div>
                        <span className={`badge ${m.lastStatus.toLowerCase()}`}>{m.active ? m.lastStatus : "PAUSED"}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
