import { useEffect, useState } from "react";
import api from "../api";

export default function Maintenance() {
    const [monitors, setMonitors] = useState([]);
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ monitorId: "", title: "", startsAt: "", endsAt: "" });

    const load = async () => {
        const [m, i] = await Promise.all([api.get("/monitors"), api.get("/maintenance")]);
        setMonitors(m.data);
        setItems(i.data);
        if (!form.monitorId && m.data[0]) setForm(f => ({ ...f, monitorId: m.data[0]._id }));
    };

    useEffect(() => { load(); }, []);

    const submit = async e => {
        e.preventDefault();
        await api.post("/maintenance", form);
        setForm(f => ({ ...f, title: "", startsAt: "", endsAt: "" }));
        load();
    };

    return (
        <div>
            <h1>Maintenance</h1>
            <p>Checks during active maintenance windows are recorded but do not open incidents.</p>

            <form className="card form" onSubmit={submit}>
                <select value={form.monitorId} onChange={e => setForm({ ...form, monitorId: e.target.value })}>
                    {monitors.map(m => <option value={m._id} key={m._id}>{m.name}</option>)}
                </select>
                <input placeholder="Maintenance title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <label>Start <input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} /></label>
                <label>End <input type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} /></label>
                <button className="primary">Schedule</button>
            </form>

            <div className="grid">
                {items.map(i => (
                    <div className="card" key={i._id}>
                        <h3>{i.title}</h3>
                        <p>{i.monitorId?.name}</p>
                        <p>{new Date(i.startsAt).toLocaleString()} → {new Date(i.endsAt).toLocaleString()}</p>
                        <span className="badge">{i.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
