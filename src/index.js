import { default as CM } from "./ConnectionManager";
export { default as ConnectionQueueItem } from "./ConnectionQueueItem";

// this will be done through proper dependency injection,
// but for this prototype, it should be good enough
export default new CM();

export const ConnectionManager = CM;
