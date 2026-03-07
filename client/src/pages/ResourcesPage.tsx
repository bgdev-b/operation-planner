import { useState, useEffect } from "react";
import { apiGet } from "../api/client";
import type { Resource } from "../types/Resource";
import { Link } from "react-router";
import "../styles/resources-page.css";

export function ResourcePage() {

    const [resource, setResource] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiGet<Resource[]>('/api/resources')
            .then(setResource)
            .catch(() => setError("Could not load resources right now."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className="resources-page">
                <section className="resources-hero resources-panel">
                    <h1 className="resources-title">Operation Planner</h1>
                    <p className="resources-subtitle">Loading resources...</p>
                </section>
            </main>
        );
    }

    return (
        <main className="resources-page">
            <section className="resources-hero resources-panel">
                <h1 className="resources-title">Operation Planner</h1>
                <p className="resources-subtitle">
                    Pick a resource to open its timeline, manage assignments, and review availability.
                </p>
            </section>

            {error ? (
                <section className="resources-panel resources-error">
                    {error}
                </section>
            ) : null}

            <section className="resources-panel">
                <div className="resources-section-head">
                    <h2 className="resources-section-title">Resources</h2>
                    <span className="resources-count">{resource.length} total</span>
                </div>

                {resource.length === 0 ? (
                    <p className="resources-empty">No resources found.</p>
                ) : (
                    <ul className="resources-grid">
                        {resource.map((r) => (
                            <li key={r.id} className="resource-item">
                                <Link className="resource-link" to={`/resources/${r.id}`}>
                                    <div className="resource-link-main">
                                        <span className="resource-name">{r.name}</span>
                                        <span className="resource-type">{r.type}</span>
                                    </div>
                                    <span className="resource-cta">Open Planner</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}