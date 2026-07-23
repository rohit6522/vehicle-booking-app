/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // tighten this to your real domain in production
    },
  });

  // Make the io instance reachable from Next.js API routes (same process).
  global._io = io;

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Rider and driver both join a room named after the ride's ID,
    // so events only go to people involved in that specific ride.
    socket.on("ride:join", (rideId) => {
      socket.join(`ride:${rideId}`);
    });

    socket.on("ride:leave", (rideId) => {
      socket.leave(`ride:${rideId}`);
    });

    // Driver periodically emits their live coordinates while on a ride.
    socket.on("driver:location", ({ rideId, lat, lng }) => {
      socket.to(`ride:${rideId}`).emit("driver:location", { lat, lng });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});