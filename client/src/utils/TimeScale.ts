const STEP_THRESHOLDS = [
    { minHours: 240, stepHours: 24 },
    { minHours: 128, stepHours: 12 },
    { minHours: 48, stepHours: 6 },
    { minHours: 18, stepHours: 3 },
    { minHours: 6, stepHours: 2 },
    { minHours: 3, stepHours: 1 },
    { minHours: 1, stepHours: 0.5 },
] as const;

export function generateTimeTicks(from: Date, to: Date): Date[] {
    const ticks: Date[] = [];

    const SECONDS_PER_MINUTES = 60;
    const MINUTES_PER_HOURS = 60;
    const MS_PER_SECOND = 1000;

    const totalMs = to.getTime() - from.getTime();
    const totalHours = totalMs / (MS_PER_SECOND * SECONDS_PER_MINUTES * MINUTES_PER_HOURS);

    const matchedThreshold = STEP_THRESHOLDS.find(t => totalHours > t.minHours);
    const stepHours = matchedThreshold?.stepHours ?? 0.25;

    const stepMs = stepHours * MS_PER_SECOND * SECONDS_PER_MINUTES * MINUTES_PER_HOURS;

    let current = new Date(from);

    while (current <= to) {
        ticks.push(new Date(current));
        current = new Date(current.getTime() + stepMs);
    }

    return ticks;
}