export type NewAvailabilitySlot = {
    resourceId: string;
    start: Date;
    end: Date;
};

export type AvailabilitySlot = NewAvailabilitySlot & {
    id: number;
}