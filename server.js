/* eslint-disable @typescript-eslint/no-require-imports */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";

const hostname = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

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


  // --- Auto-expire stale ride requests (Rapido/Uber-style) ---
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    const RideSchema = new mongoose.Schema({}, { strict: false });

   const Ride = mongoose.models.RideAutoExpire || mongoose.model("RideAutoExpire", RideSchema, "rides");

    const EXPIRY_MINUTES = 10;

    setInterval(async () => {
      const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);
      const staleRides = await Ride.find({
        status: "requested",
        requestedAt: { $lt: cutoff },
      });

      for (const ride of staleRides) {
        ride.status = "cancelled";
        ride.cancelledAt = new Date();
        ride.cancelledBy = "rider"; // system-expired, closest existing enum value
        await ride.save();
        io.to(`ride:${ride._id}`).emit("ride:update", { ride });
        console.log(`Auto-cancelled stale ride ${ride._id}`);
      }
    }, 60 * 1000); // check every 1 minute
  }).catch((err) => {
    console.error("Auto-expiry: MongoDB connection failed:", err);
  });
});