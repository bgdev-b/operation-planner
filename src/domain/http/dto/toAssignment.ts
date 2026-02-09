import { Assignment } from "../../Assignment.js";
import { AssignmentDto } from "./assignmentDto.js";

export function toAssignment(dto: AssignmentDto): Assignment {
    return {
        taskId: dto.taskId,
        resourceId: dto.resourceId,
        start: new Date(dto.start),
        end: new Date(dto.end)
    };
}