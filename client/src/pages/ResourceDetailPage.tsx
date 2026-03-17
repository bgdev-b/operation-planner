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

type ApiError = Error & {
    data?: {
        error?: string;
        message?: string;
    };
};

function getApiErrorMessage(error: unknown) {
    if (error && typeof error === "object") {
        const apiError = error as ApiError;
        if (apiError.data?.message) return apiError.data.message;
        if (apiError.data?.error) return apiError.data.error;
        if (apiError.message) return apiError.message;
    }

    return "Failed to load availability";
}

export function ResourceDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [resourceName, setResourceName] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [data, setData] = useState<ResourceResponse | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState("Failed to load availability");

    useEffect(() => {
        if (!id) return;
        apiGet<{ id: string; name: string; type: string }>(`/api/resources/${id}`)
            .then((res) => setResourceName(res.name))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id || !from || !to) return;

        setStatus('loading');
        setErrorMessage("Failed to load availability");

        const timeout = setTimeout(async () => {
            try {
                const result = await apiGet<ResourceResponse>(
                    `/api/resources/${id}/free-slots?from=${new Date(from).toISOString()}&to=${new Date(to).toISOString()}`
                );

                setData(result);
                setErrorMessage("Failed to load availability");
                setStatus('success')
            } catch (error: unknown) {
                setErrorMessage(getApiErrorMessage(error));
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
            setErrorMessage("Failed to load availability");
        }

        try {
            const result = await apiGet<ResourceResponse>(
                `/api/resources/${id}/free-slots?from=${new Date(from).toISOString()}&to=${new Date(to).toISOString()}`
            );

            setData(result);
            setErrorMessage("Failed to load availability");
            setStatus("success");

            if (preserveScroll) {
                requestAnimationFrame(() => {
                    window.scrollTo(scrollX, scrollY);
                });
            }
        } catch (error: unknown) {
            setErrorMessage(getApiErrorMessage(error));
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
                <p className="resource-detail-error">{errorMessage}</p>
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