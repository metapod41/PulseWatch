import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PublicStatus() {
    const { userId } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/status/${userId}`)
            .then(r => r.json())
            .then(setData);
    }, [userId]);

    if (!data) return <p className="container">Loading status...</p>;

    return (
        <div className="container">
            <h1>{data.service} Status</h1>
            <p>Last updated: {new Date(data.generatedAt).toLocaleString()}</p>
            {data.monitors.map(m => (
                <div className="card monitor" key={m.id}>
                    <div>
                        <h2>{m.name}</h2>
                        <p>{m.url}</p>
                    </div>
                    <span className={`badge ${m.status.toLowerCase()}`}>{m.status}</span>
                </div>
            ))}
        </div>
    );
}
