import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { Resource } from "../types/Resource";

export function ResourceDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        apiGet<Resource>(`/api/resources/${id}`)
            .then(setResource)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Loading resoucers...</p>
    if (!resource) return <p>Resource not found</p>

    return (
        <div>
            <h1>{resource.name}</h1>
            <p>Type: {resource.type}</p>
        </div>
    );
}