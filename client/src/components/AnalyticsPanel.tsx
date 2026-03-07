import type { AvailabilityAnalytics } from "../types/AvailabilityAnalytics";
import "../styles/analytics.css";

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

    const safeUtilization = Math.max(0, Math.min(100, utilizationPercentage));

    return (
        <section className="analytics-panel">
            <h3 className="analytics-title">Analytics</h3>

            <div className="analytics-grid">
                <div className="analytics-metric">
                    <span className="analytics-label">Total Capacity</span>
                    <span className="analytics-value">{formatMinutes(totalCapacityMinutes)}</span>
                </div>

                <div className="analytics-metric">
                    <span className="analytics-label">Busy Time</span>
                    <span className="analytics-value">{formatMinutes(totalBusyMinutes)}</span>
                </div>

                <div className="analytics-metric">
                    <span className="analytics-label">Free Time</span>
                    <span className="analytics-value">{formatMinutes(totalFreeMinutes)}</span>
                </div>

                <div className="analytics-metric">
                    <span className="analytics-label">Utilization</span>
                    <span className="analytics-value">{safeUtilization}%</span>
                </div>
            </div>

            <p className="analytics-progress-label">Utilization</p>
            <div className="analytics-progress-track">
                <div
                    className="analytics-progress-fill"
                    style={{ width: `${safeUtilization}%` }}
                />
            </div>
        </section>
    );
}