export type ConflictType =
    | 'OVERLAPPING_ASSIGNMENT'
    | 'RESOURCE_UNAVAILABLE'
    ;

export type Conflict = {
    type: ConflictType;
    resourceId: string;
    taskId: string;
    message: string;
};