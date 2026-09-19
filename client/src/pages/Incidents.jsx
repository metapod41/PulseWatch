import { useEffect, useState } from "react";
import api from "../api";

export default function Incidents() {
    const [items, setItems] = useState([]);

    const load = async () => setItems((await api.get("/incidents")).data);

    useEffect(() => { load(); }, []);

    const resolve = async (id) => {
        await api.put(`/incidents/${id}/resolve`);
        load();
    };

    return (
        <div>
            <h1>Incidents</h1>
            <div className="grid">
                {items.map(i => (
                    <div className="card" key={i._id}>
                        <h3>{i.monitorId?.name}</h3>
                        <p>{i.reason}</p>
                        <p>Started: {new Date(i.startedAt).toLocaleString()}</p>
                        <p>Failures: {i.failureCount}</p>
                        <span className={`badge ${i.status === "OPEN" ? "down" : "up"}`}>{i.status}</span>
                        {i.status === "OPEN" && <button onClick={() => resolve(i._id)}>Resolve</button>}
                    </div>
                ))}
            </div>
        </div>
    );
}
