import type { AvailabilityAnalytics } from "../types/AvailabilityAnalytics";

type Props = {
    analytics: AvailabilityAnalytics;
}

export function AnalyticsPanel({ analytics }: Props) {

    const {
        totalCapacityMinutes,
        totalFreeMinutes,
        totalBusyMinutes,
        utilizationPercentage
    } = analytics;

    function formatMinutes(minutes: number) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    return (
        <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ddd" }}>
            <h3>Analytics</h3>

            <p>Total Capacity: {formatMinutes(totalCapacityMinutes)}</p>
            <p>Busy Time: {formatMinutes(totalBusyMinutes)}</p>
            <p>Free Time: {formatMinutes(totalFreeMinutes)} </p>
            <p>Utilization: {utilizationPercentage}%</p>

            <div style={{
                height: "12px",
                background: "#eee",
                marginTop: "10px",
                position: "relative"
            }}>
                <div style={{
                    width: `${utilizationPercentage}%`,
                    height: "100%",
                    background: "#3b82f6"
                }}>

                </div>
            </div>
        </div>
    );
}