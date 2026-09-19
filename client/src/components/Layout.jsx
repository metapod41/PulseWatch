import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div>
            <nav className="nav">
                <Link className="brand" to="/dashboard">PulseWatch</Link>
                {user && (
                    <div className="navlinks">
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/monitors">Monitors</Link>
                        <Link to="/incidents">Incidents</Link>
                        <Link to="/maintenance">Maintenance</Link>
                        <button onClick={() => { logout(); navigate("/login"); }}>
                            Logout
                        </button>
                    </div>
                )}
            </nav>
            <main className="container">{children}</main>
        </div>
    );
}
