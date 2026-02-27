import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import { CreateAssignmentForm } from "../components/CreateAssignmentForm";
import { AvailabilityChecker } from "../components/AvailabilityChecker";
import { FreeSlotsList } from "../components/FreeSlotsList";
import { AnalyticsPanel } from "../components/AnalyticsPanel";

import type { TimeRange } from "../types/TimeRange";
import type { AvailabilityAnalytics } from "../types/AvailabilityAnalytics";
import { GanttTimeline } from "../components/GanttTimeline";

type ResourceResponse = {
    id: string;
    name: string;
    type: string;
    availability: TimeRange[];
    assignments: TimeRange[];
    freeSlot: TimeRange[];
    analytics: AvailabilityAnalytics;
};

type Status = "idle" | "loading" | "success" | "error";

export function ResourceDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [resourceName, setResourceName] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [data, setData] = useState<ResourceResponse | null>(null);
    const [status, setStatus] = useState<Status>("idle");

    useEffect(() => {
        if (!id) return;

        apiGet<{ id: string; name: string; type: string }>(
            `/api/resources/${id}`
        )
            .then((res) => {
                setResourceName(res.name);
            })
            .finally(() => setLoading(false));
    }, [id]);

    async function fetchAvailability() {
        if (!id || !from || !to) return;

        setStatus("loading");

        try {
            const result = await apiGet<ResourceResponse>(
                `/api/resources/${id}/free-slots?from=${new Date(from).toISOString()}&to=${new Date(to).toISOString()}`
            );

            setData(result);
            setStatus("success");
        } catch {
            setStatus("error");
        }
    }

    function handleAssignmentCreated() {
        fetchAvailability();
    }

    if (loading) return <p>Loading resource...</p>;
    if (!id) return <p>Invalid resource</p>;

    return (
        <div>
            <h1>{resourceName}</h1>

            <CreateAssignmentForm
                resourceId={id}
                onCreated={handleAssignmentCreated}
            />

            <AvailabilityChecker
                from={from}
                to={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onCheck={fetchAvailability}
                status={status}
            />

            {status === "error" && (
                <p style={{ color: "red" }}>Failed to load availability</p>
            )}

            {status === "success" && data?.analytics && (
                <>
                    <AnalyticsPanel analytics={data.analytics} />
                    <FreeSlotsList slots={data.freeSlot} />

                    < GanttTimeline
                        from={new Date(from)}
                        to={new Date(to)}
                        availability={data?.availability}
                        assignment={data?.assignments}
                    />
                </>
            )}

        </div>
    );
}