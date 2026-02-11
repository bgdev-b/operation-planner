export type ConflictType =
    | 'OVERLAPPING_ASSIGNMENT'
    | 'RESOURCE_UNAVAILABLE'
    | 'INVALID_TIME_RANGE'
    ;

export type Conflict = {
    type: ConflictType;
    resourceId: string;
    taskId: string;
    message: string;
};