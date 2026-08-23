"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Car, Landmark, FileText, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetch(`/api/admin/vendors/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vendor) setVendor(data.vendor);
        else setError(data.error ?? "Could not load vendor");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      toast.success("Vendor approved");
      router.push("/admin/dashboard");
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 3) return;
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      toast.success("Vendor rejected");
      router.push("/admin/dashboard");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-6"
          >
            <ArrowLeft size={16} />
            Back
          </button>

                    {loading ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : !vendor ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                <div className="min-w-0">
                  <h1 className="text-2xl font-black truncate">{vendor.name}</h1>
                  <p className="text-neutral-500 text-sm truncate">{vendor.email}</p>
                </div>
                <StatusBadge status={vendor.partnerStatus} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card icon={Car} title="Vehicle Details">
                  <Row label="Vehicle Type" value={vendor.vehicle?.type} />
                  <Row label="Registration Number" value={vendor.vehicle?.numberPlate} />
                  <Row label="Model" value={vendor.vehicle?.model} />
                </Card>

                <Card icon={Landmark} title="Bank Details">
                  <Row label="Account Holder" value={vendor.bankDetails?.accountHolderName} />
                  <Row label="IFSC Code" value={vendor.bankDetails?.ifsc} />
                  <Row label="UPI ID" value={vendor.bankDetails?.upi || "—"} />
                </Card>

                <div className="md:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={16} />
                    <h2 className="font-bold">Documents</h2>
                  
                  </div>


                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <DocPreview label="Aadhaar" url={vendor.documents?.aadhaarUrl} />
                    <DocPreview label="License" url={vendor.documents?.licenseUrl} />
                    <DocPreview label="RC" url={vendor.documents?.rcUrl} />
                  </div>
                </div>

                <div className="md:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} />
                    <h2 className="font-bold">Admin Decision</h2>
                  </div>
                  <p className="text-sm text-neutral-500 mb-5">
                    Verify documents carefully before approving.
                  </p>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                      {error}
                    </p>
                  )}

                  {vendor.partnerStatus === "pending" ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleApprove}
                        disabled={processing}
                        className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      >
                        {processing ? "Processing..." : "Approve Vendor"}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={processing}
                        className="w-full py-3.5 rounded-full border border-neutral-200 text-neutral-700 font-semibold hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        Reject Vendor
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-neutral-500">
                        This application has already been reviewed.
                      </p>
                      {vendor.partnerStatus === "rejected" && vendor.rejectionReason && (
                        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">
                          Reason: {vendor.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                            </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            aria-label="Close"
            onClick={() => setShowRejectModal(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Reject Vendor</h3>
            <textarea
              autoFocus
              placeholder="Enter rejection reason (required)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm resize-none focus:outline-none focus:border-black mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 rounded-full border border-neutral-200 font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectReason.trim().length < 3 || processing}
                className="flex-1 py-3 rounded-full bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-40"
              >
                {processing ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Card({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} />
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

function DocPreview({ label, url }: { label: string; url?: string }) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <p className="text-xs font-semibold px-3 py-2 border-b border-neutral-200">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img src={url} alt={label} className="w-full h-32 object-cover" />
          <p className="text-xs text-center py-2 text-neutral-500 hover:text-black">
            Open full document
          </p>
        </a>
      ) : (
        <p className="text-xs text-neutral-400 text-center py-10">Not uploaded</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-600",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${styles[status] ?? "bg-neutral-100 text-neutral-600"}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}