import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const initial = {
    name: "",
    url: "",
    method: "GET",
    interval: 30,
    timeout: 5000,
    expectedStatus: 200,
    active: true,
    requestHeaders: {},
    requestBody: "",
    responseContains: "",
    responseJsonPath: "",
    responseJsonValue: ""
};

export default function Monitors() {
    const [form, setForm] = useState(initial);
    const [monitors, setMonitors] = useState([]);
    const [error, setError] = useState("");

    const load = async () => {
        const { data } = await api.get("/monitors");
        setMonitors(data);
    };

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/monitors", form);
            setForm(initial);
            setError("");
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Could not create monitor");
        }
    };

    const toggle = async (m) => {
        await api.put(`/monitors/${m._id}`, { ...m, active: !m.active });
        load();
    };

    const remove = async (id) => {
        if (!confirm("Delete this monitor?")) return;
        await api.delete(`/monitors/${id}`);
        load();
    };

    return (
        <div>
            <div className="pagehead">
                <div><h1>Monitors</h1><p>Create and manage API checks.</p></div>
            </div>

            <form className="card form" onSubmit={submit}>
                <h2>New monitor</h2>
                {error && <div className="error">{error}</div>}
                <div className="formgrid">
                    <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <input placeholder="https://api.example.com/health" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
                    <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                        {["GET","POST","PUT","PATCH","DELETE"].map(x => <option key={x}>{x}</option>)}
                    </select>
                    <input type="number" min="5" placeholder="Interval (seconds)" value={form.interval} onChange={e => setForm({ ...form, interval: Number(e.target.value) })} />
                    <input type="number" min="500" placeholder="Timeout (ms)" value={form.timeout} onChange={e => setForm({ ...form, timeout: Number(e.target.value) })} />
                    <input type="number" min="100" max="599" placeholder="Expected status" value={form.expectedStatus} onChange={e => setForm({ ...form, expectedStatus: Number(e.target.value) })} />
                </div>
                <details>
                    <summary>Advanced request/response validation</summary>
                    <div className="formgrid">
                        <textarea placeholder='Request headers JSON, e.g. {"Authorization":"Bearer ..."}'
                            value={JSON.stringify(form.requestHeaders)}
                            onChange={e => {
                                try { setForm({ ...form, requestHeaders: JSON.parse(e.target.value || "{}") }); } catch {}
                            }} />
                        <textarea placeholder="Request body" value={form.requestBody} onChange={e => setForm({ ...form, requestBody: e.target.value })} />
                        <input placeholder="Response must contain text" value={form.responseContains} onChange={e => setForm({ ...form, responseContains: e.target.value })} />
                        <input placeholder="JSON path, e.g. data.status" value={form.responseJsonPath} onChange={e => setForm({ ...form, responseJsonPath: e.target.value })} />
                        <input placeholder="Expected JSON value" value={form.responseJsonValue} onChange={e => setForm({ ...form, responseJsonValue: e.target.value })} />
                    </div>
                </details>
                <button className="primary">Create monitor</button>
            </form>

            <div className="grid">
                {monitors.map(m => (
                    <div className="card monitor" key={m._id}>
                        <div>
                            <Link to={`/monitors/${m._id}`}><h3>{m.name}</h3></Link>
                            <p>{m.method} · every {m.interval}s · {m.url}</p>
                        </div>
                        <div className="actions">
                            <span className={`badge ${m.lastStatus.toLowerCase()}`}>{m.active ? m.lastStatus : "PAUSED"}</span>
                            <button onClick={() => toggle(m)}>{m.active ? "Pause" : "Resume"}</button>
                            <button onClick={() => remove(m._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
