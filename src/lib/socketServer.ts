import type { Server } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var _io: Server | undefined;
}

/**
 * Returns the Socket.io server instance created in server.js.
 * Returns undefined if called outside the custom server (e.g. during
 * `next build`), so callers should always check before using it.
 */
export function getIO(): Server | undefined {
  return global._io;
}