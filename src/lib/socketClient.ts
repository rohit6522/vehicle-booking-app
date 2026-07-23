"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns a single shared Socket.io client connection, creating it on
 * first use. Reused across components so we don't open multiple sockets.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/socket.io",
    });
  }
  return socket;
}