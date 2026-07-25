"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Clock, XCircle, PartyPopper, AlertTriangle, Video } from "lucide-react";
import { PartnerNavbar } from "@/components/partner/PartnerNavbar";
import { Footer } from "@/components/marketing/Footer";
import { PartnerStepper, StepState } from "@/components/partner/PartnerStepper";
import { VehicleStep } from "@/components/partner/VehicleStep";
import { DocumentsStep } from "@/components/partner/DocumentsStep";
import { BankStep } from "@/components/partner/BankStep";
import { ReviewStep } from "@/components/partner/ReviewStep";
import { PricingStep } from "@/components/partner/PricingStep";

type WizardStep = "vehicle" | "documents" | "bank" | "review";

interface PartnerStatus {
  role: string;
  partnerStep: string | null;
  partnerStatus: "not_applied" | "pending" | "approved" | "rejected";
  kycStatus: string;
  hasVehicle: boolean;
  hasDocuments: boolean;
  hasBank: boolean;
  rejectionReason: string | null;
  vehicle: any;
  documents: any;
  bankDetails: any;
  kycCallStarted: boolean;
  pricingStatus: string;
}

export default function BecomePartnerPage() {
 const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<PartnerStatus | null>(null);
  const [step, setStep] = useState<WizardStep>("vehicle");
  const [editingAfterRejection, setEditingAfterRejection] = useState(false);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    fetch("/api/partner/status")
      .then((res) => res.json())
      .then((data: PartnerStatus) => {
        setStatus(data);

        if (data.partnerStatus === "not_applied") {
          if (!data.hasVehicle) setStep("vehicle");
          else if (!data.hasDocuments) setStep("documents");
          else if (!data.hasBank) setStep("bank");
          else setStep("review");
        }
      })
      .finally(() => setLoading(false));
  }, [sessionStatus]);

  // Keep polling while we're waiting on an admin action (approval, KYC,
  // pricing review) so the screen updates itself without a manual refresh.
  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    if (!status) return;

    const stillWaiting =
      status.partnerStatus === "pending" ||
      (status.partnerStatus === "approved" && status.kycStatus !== "approved");

    if (!stillWaiting) return;

    const interval = setInterval(refreshStatus, 4000);
    return () => clearInterval(interval);
  }, [sessionStatus, status]);

  function refreshStatus() {
    fetch("/api/partner/status")
      .then((res) => res.json())
      .then(setStatus);
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <>
        <PartnerNavbar />
        <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 text-center">
          <div>
            <h1 className="text-2xl font-black mb-2">Login required</h1>
            <p className="text-neutral-500">
              Please log in first to apply as a partner.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (loading || !status) {
    return (
      <>
        <PartnerNavbar />
        <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  function stepperStates(): StepState[] {
    const s = status!;
    const vehicle: StepState = s.hasVehicle ? "done" : "current";
    const documents: StepState = s.hasDocuments
      ? "done"
      : s.hasVehicle
        ? "current"
        : "locked";
    const bank: StepState = s.hasBank
      ? "done"
      : s.hasDocuments
        ? "current"
        : "locked";
    const review: StepState =
      s.partnerStatus === "pending" || s.partnerStatus === "approved"
        ? "done"
        : s.hasBank
          ? "current"
          : "locked";

    const videoKyc: StepState =
      s.kycStatus === "approved"
        ? "done"
        : s.partnerStatus === "approved"
        ? "current"
        : "locked";

   const pricing: StepState =
      s.role === "driver"
        ? "done"
        : s.kycStatus === "approved"
        ? "current"
        : "locked";

   const finalReview: StepState = s.role === "driver" ? "done" : "locked";
    const live: StepState = s.role === "driver" ? "current" : "locked";

    return [
      vehicle,
      documents,
      bank,
      review,
      videoKyc,
      pricing,
      finalReview,
      live,
    ];
  }

  const shell = (children: React.ReactNode) => (
    <>
      <PartnerNavbar />
      <main className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-black mb-1">Partner Dashboard</h1>
          <p className="text-neutral-500 mb-6">
            Complete all steps to activate your account
          </p>
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6">
            <PartnerStepper states={stepperStates()} />
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );

  // Already an approved driver.
  if (status.role === "driver") {
    return shell(
      <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <PartyPopper size={18} />
        </div>
        <div>
          <p className="font-semibold">You&apos;re live!</p>
          <p className="text-sm text-neutral-500">
            Head to your{" "}
            <a href="/driver/requests" className="underline">
              ride requests
            </a>{" "}
            to start accepting bookings.
          </p>
        </div>
      </div>,
    );
  }

  // Submitted, waiting on admin — unless they're actively resubmitting after a rejection.
  if (status.partnerStatus === "pending" && !editingAfterRejection) {
    return shell(
      <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
          <Clock size={18} />
        </div>
        <div>
          <p className="font-semibold">Documents Under Review</p>
          <p className="text-sm text-neutral-500">
            Admin is verifying your documents.
          </p>
        </div>
      </div>,
    );
  }

  // Application approved, waiting for Video KYC.
  if (status.partnerStatus === "approved" && status.kycStatus !== "approved") {
    return shell(
      status.kycCallStarted ? (
        <div className="bg-white rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <Video size={18} />
            </div>
            <div>
              <p className="font-semibold">Admin Started Video KYC</p>
              <p className="text-sm text-neutral-500">
                Join now to complete verification.
              </p>
            </div>
          </div>
          <a
           href={`/video-kyc/kyc-${(session?.user as any)?.id}`}
            className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
          >
            Join Call
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <p className="font-semibold">Waiting for Admin</p>
            <p className="text-sm text-neutral-500">
              Admin will initiate Video KYC shortly.
            </p>
          </div>
        </div>
      ),
    );
  }

  // KYC approved — now show Pricing step (or its pending-review state).
  if (status.kycStatus === "approved" && status.role !== "driver") {
    if (status.pricingStatus === "pending") {
      return shell(
        <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <p className="font-semibold">Pricing Under Review</p>
            <p className="text-sm text-neutral-500">Admin is reviewing your pricing.</p>
          </div>
        </div>
      );
    }
    return shell(
      <div className="flex justify-center">
        <PricingStep />
      </div>
    );
  }

  const rejectedBanner = status.partnerStatus === "rejected" &&
    !editingAfterRejection && (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-red-500" />
          <p className="font-semibold text-red-700">Documents Rejected</p>
        </div>
        <div className="bg-white border border-red-100 rounded-xl px-4 py-3 text-sm text-neutral-700 mb-4">
          {status.rejectionReason || "No reason provided."}
        </div>
        <button
          onClick={() => {
            setEditingAfterRejection(true);
            setStep("documents");
          }}
          className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
        >
          Update Documents
        </button>
      </div>  
    );

  if (status.partnerStatus === "rejected" && !editingAfterRejection) {
    return shell(rejectedBanner);
  }

  // Actively filling out (or resubmitting) the wizard.
  return shell(
    <div className="flex justify-center">
      {step === "vehicle" && (
        <VehicleStep
          onNext={() => {
            refreshStatus();
            setStep("documents");
          }}
        />
      )}
      {step === "documents" && (
        <DocumentsStep
          onBack={() => setStep("vehicle")}
          onNext={() => {
            refreshStatus();
            setStep("bank");
          }}
          existingDocuments={status.documents}
        />
      )}
      {step === "bank" && (
        <BankStep
          onBack={() => setStep("documents")}
          onNext={() => {
            refreshStatus();
            setStep("review");
          }}
          existingBank={status.bankDetails}
        />
      )}
      {step === "review" && (
        <ReviewStep
          onBack={() => setStep("bank")}
          onSubmitted={() => {
            setEditingAfterRejection(false);
            refreshStatus();
          }}
        />
      )}
    </div>,
  );
}
