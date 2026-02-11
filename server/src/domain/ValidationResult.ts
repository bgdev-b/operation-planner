import { Conflict } from "./Conflict.js";

export type ValidationResult =
    | { valid: true }
    | { valid: false; conflicts: Conflict[] };