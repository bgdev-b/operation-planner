

export type ResourceType = 'person' | 'room' | 'machine';

export type TimeRange = {
    start: Date;
    end: Date;
};

export type Resource = {
    id: string;
    name: string;
    type: ResourceType;
    availability: TimeRange[];
}