import { EventEmitter } from "node:events";

// Use globalThis to persist EventEmitter across HMR reloads and module re-evaluations
const globalForEvents = globalThis as unknown as { projectEvents: EventEmitter };

if (!globalForEvents.projectEvents) {
  globalForEvents.projectEvents = new EventEmitter();
  globalForEvents.projectEvents.setMaxListeners(100);
}

const projectEvents = globalForEvents.projectEvents;

export function emitProjectUpdate(projectId: string, data: any) {
  console.log(`[Events] Emitting update for project: ${projectId}`);
  console.log(
    `[Events] Current listeners for project:${projectId}:`,
    projectEvents.listenerCount(`project:${projectId}`)
  );
  projectEvents.emit(`project:${projectId}`, data);
}

export function onProjectUpdate(projectId: string, callback: (data: any) => void) {
  const eventName = `project:${projectId}`;
  projectEvents.on(eventName, callback);
  console.log(
    `[Events] Subscribed to ${eventName}, total listeners: ${projectEvents.listenerCount(eventName)}`
  );

  // Return cleanup function
  return () => {
    projectEvents.off(eventName, callback);
    console.log(
      `[Events] Unsubscribed from ${eventName}, remaining listeners: ${projectEvents.listenerCount(eventName)}`
    );
  };
}
