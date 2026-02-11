export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
    id: string;
    name: string;
    durationMinutes: number;
    priority: TaskPriority;
    requiredResourceIds: string[];
};