import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import { DateRangePicker } from "../components/DateRangePicker";
import { FreeSlotsList } from "../components/FreeSlotsList";
import { AnalyticsPanel } from "../components/AnalyticsPanel";
import "../styles/resource-detail.css";

import type { TimeRange } from "../types/TimeRange";
import type { AvailabilityAnalytics } from "../types/AvailabilityAnalytics";
import { GanttTimeline } from "../components/GanttTimeline";
import type { Assignment } from "../types/Assignments";

type ResourceResponse = {
    id: string;
    name: string;
    type: string;
    availability: TimeRange[];
    assignments: Assignment[];
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
        apiGet<{ id: string; name: string; type: string }>(`/api/resources/${id}`)
            .then((res) => setResourceName(res.name))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id || !from || !to) return;

        setStatus('loading');

        const timeout = setTimeout(async () => {
            try {
                const result = await apiGet<ResourceResponse>(
                    `/api/resources/${id}/free-slots?from=${new Date(from).toISOString()}&to=${new Date(to).toISOString()}`
                );

                setData(result);
                setStatus('success')
            } catch {
                setStatus('error')
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [id, from, to]);

    async function fetchAvailability(options?: { keepStatus?: boolean; preserveScroll?: boolean }) {
        if (!id || !from || !to) return;

        const keepStatus = options?.keepStatus ?? false;
        const preserveScroll = options?.preserveScroll ?? false;

        const { scrollX, scrollY } = window;

        if (!keepStatus) {
            setStatus("loading");
        }

        try {
            const result = await apiGet<ResourceResponse>(
                `/api/resources/${id}/free-slots?from=${new Date(from).toISOString()}&to=${new Date(to).toISOString()}`
            );

            setData(result);
            setStatus("success");

            if (preserveScroll) {
                requestAnimationFrame(() => {
                    window.scrollTo(scrollX, scrollY);
                });
            }
        } catch {
            setStatus("error");
        }
    }

    function handleAssignmentCreated() {
        void fetchAvailability({ keepStatus: true, preserveScroll: true });
    }

    if (loading) return <p className="resource-detail-page">Loading resource...</p>;
    if (!id) return <p>Invalid resource</p>;

    return (
        <div className="resource-detail-page">
            <header className="resource-detail-header">
                <h1 className="resource-detail-title">{resourceName}</h1>
                <p className="resource-detail-subtitle">Plan tasks directly on the timeline with drag and right-click actions.</p>
            </header>

            <div className="resource-detail-block">
                <DateRangePicker
                    from={from}
                    to={to}
                    onChange={(from, to) => {
                        setFrom(from);
                        setTo(to);
                    }}
                />
            </div>

            {status === "error" && (
                <p className="resource-detail-error">Failed to load availability</p>
            )}

            {status === "success" && data?.analytics && (
                <>
                    <AnalyticsPanel analytics={data.analytics} />
                    <FreeSlotsList slots={data.freeSlot} />

                    <div className="resource-detail-block">
                        < GanttTimeline
                            resourceId={id}
                            from={new Date(from)}
                            to={new Date(to)}
                            availability={data?.availability}
                            assignment={data?.assignments}
                            onAssignmentCreated={handleAssignmentCreated}
                        />
                    </div>
                </>
            )}

        </div>
    );
}