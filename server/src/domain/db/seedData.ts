import type { Resource } from "../Resource.js";
import { createAvailabilitySlot, getAvailabilityByResource } from "./availabilityRepository.js";
import { getAllResources, saveResource } from "./resourceRepository.js";

const DEFAULT_RESOURCES: Resource[] = [
    { id: "r-01", name: "Alex", type: "person" },
    { id: "r-02", name: "Sala Norte", type: "room" },
    { id: "r-03", name: "Forklift A", type: "equipment" },
];

const DEFAULT_AVAILABILITY_START = new Date("2000-01-01T00:00:00.000Z");
const DEFAULT_AVAILABILITY_END = new Date("2100-01-01T00:00:00.000Z");

export function ensureSeedData(): void {
    const existingResources = getAllResources();
    if (existingResources.length > 0) {
        return;
    }

    for (const resource of DEFAULT_RESOURCES) {
        saveResource(resource);

        if (getAvailabilityByResource(resource.id).length === 0) {
            createAvailabilitySlot(resource.id, DEFAULT_AVAILABILITY_START, DEFAULT_AVAILABILITY_END);
        }
    }
}
