import { useState, useEffect } from "react";
import { apiGet } from "../api/client";
import type { Resource } from "../types/Resource";
import { Link } from "react-router";

export function ResourcePage() {

    const [resource, setResource] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<Resource[]>('/api/resources')
            .then(setResource)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading resources...</p>;

    return (
        <section>
            <h1>Resources</h1>
            <ul>
                {resource.map(r => (
                    <li key={r.id}>
                        <Link to={`/resources/${r.id}`}>
                            {r.name} - {r.type}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}