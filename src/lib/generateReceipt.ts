import jsPDF from "jspdf";

interface RideForReceipt {
  _id: string;
  pickup: { address: string };
  drop: { address: string };
  vehicleType: string;
  distanceKm: number;
  fare: { estimated: number; final?: number };
  paymentMethod?: "cash" | "online";
  paymentStatus: string;
  requestedAt: string;
  completedAt?: string;
  driver?: { name?: string; vehicle?: { numberPlate?: string; make?: string; model?: string } };
}

export function generateReceipt(ride: RideForReceipt) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const amount = ride.fare.final ?? ride.fare.estimated;

  const marginX = 48;
  let y = 60;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("RYDEX", marginX, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text("Trip Receipt", marginX, y + 16);
  doc.setTextColor(0);

  y += 50;
  doc.setDrawColor(230);
  doc.line(marginX, y, 547, y);
  y += 30;

  // Trip details
  doc.setFontSize(11);
  const row = (label: string, value: string) => {
    doc.setTextColor(130);
    doc.text(label, marginX, y);
    doc.setTextColor(0);
    doc.text(value, 220, y);
    y += 22;
  };

  row("Receipt ID", ride._id);
  row(
    "Date",
    new Date(ride.completedAt ?? ride.requestedAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  );
  row("Vehicle Type", ride.vehicleType.charAt(0).toUpperCase() + ride.vehicleType.slice(1));
  row("Distance", `${ride.distanceKm} km`);
  if (ride.driver?.name) row("Driver", ride.driver.name);
  if (ride.driver?.vehicle?.numberPlate) row("Vehicle Plate", ride.driver.vehicle.numberPlate);

  y += 10;
  doc.setDrawColor(230);
  doc.line(marginX, y, 547, y);
  y += 30;

  // Route
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Route", marginX, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(130);
  doc.text("Pickup:", marginX, y);
  doc.setTextColor(0);
  doc.text(doc.splitTextToSize(ride.pickup.address, 350), 100, y);
  y += doc.splitTextToSize(ride.pickup.address, 350).length * 14 + 10;

  doc.setTextColor(130);
  doc.text("Drop:", marginX, y);
  doc.setTextColor(0);
  doc.text(doc.splitTextToSize(ride.drop.address, 350), 100, y);
  y += doc.splitTextToSize(ride.drop.address, 350).length * 14 + 20;

  doc.setDrawColor(230);
  doc.line(marginX, y, 547, y);
  y += 30;

  // Payment
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Payment", marginX, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  row("Method", ride.paymentMethod === "cash" ? "Cash" : "Online (Razorpay)");
  row("Status", ride.paymentStatus === "paid" ? "Paid" : "Pending");

  y += 10;
  doc.setDrawColor(0);
  doc.line(marginX, y, 547, y);
  y += 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Total Fare", marginX, y);
  doc.text(`₹${amount}`, 480, y, { align: "right" });

  y += 50;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Thank you for riding with RYDEX.", marginX, y);

  doc.save(`RYDEX-Receipt-${ride._id.slice(-8)}.pdf`);
}