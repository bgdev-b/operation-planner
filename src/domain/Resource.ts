
export type ResourceType = 'person' | 'room' | 'equipment';

export type Resource = {
    id: string;
    name: string;
    type: ResourceType;
}