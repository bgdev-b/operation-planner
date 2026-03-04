export const MS_PER_SECOND = 1000;
export const SECOND_PER_MINUTES = 60;
export const MINUTES_PER_HOUR = 60;

export const MS_PER_MINUTE = SECOND_PER_MINUTES * MS_PER_SECOND;
export const MS_PER_HOUR = MINUTES_PER_HOUR * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

export const minutes = (m: number) => m * MS_PER_MINUTE;
export const hours = (h: number) => h * MS_PER_HOUR;
export const days = (d: number) => d * MS_PER_DAY;

export const snapTo = (ms: number, stepMs: number) =>
    Math.round(ms / stepMs) * stepMs;
