"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Clock, XCircle, PartyPopper } from "lucide-react";
import { PartnerStepper, StepState } from "@/components/partner/PartnerStepper";
import { VehicleStep } from "@/components/partner/VehicleStep";
import { DocumentsStep } from "@/components/partner/DocumentsStep";
import { BankStep } from "@/components/partner/BankStep";
import { ReviewStep } from "@/components/partner/ReviewStep";

type WizardStep = "vehicle" | "documents" | "bank" | "review";

interface PartnerStatus {
  role: string;
  partnerStep: string | null;
  partnerStatus: "not_applied" | "pending" | "approved" | "rejected";
  kycStatus: string;
  hasVehicle: boolean;
  hasDocuments: boolean;
  hasBank: boolean;
}

export default function BecomePartnerPage() {
  const { status: sessionStatus } = useSession();
  const [status, setStatus] = useState<PartnerStatus | null>(null);
  const [step, setStep] = useState<WizardStep>("vehicle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    fetch("/api/partner/status")
      .then((res) => res.json())
      .then((data: PartnerStatus) => {
        setStatus(data);

        // Resume the wizard at the right step based on what's already saved.
        if (data.partnerStatus === "not_applied" || data.partnerStatus === "rejected") {
          if (!data.hasVehicle) setStep("vehicle");
          else if (!data.hasDocuments) setStep("documents");
          else if (!data.hasBank) setStep("bank");
          else setStep("review");
        }
      })
      .finally(() => setLoading(false));
  }, [sessionStatus]);

  function refreshStatus() {
    fetch("/api/partner/status")
      .then((res) => res.json())
      .then(setStatus);
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Login required</h1>
          <p className="text-neutral-500">Please log in first to apply as a partner.</p>
        </div>
      </main>
    );
  }

  if (loading || !status) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Loading...</p>
      </main>
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
    const bank: StepState = s.hasBank ? "done" : s.hasDocuments ? "current" : "locked";
    const review: StepState =
      s.partnerStatus !== "not_applied" && s.partnerStatus !== "rejected"
        ? "done"
        : s.hasBank
        ? "current"
        : "locked";
    const finalReview: StepState =
      s.role === "driver" ? "done" : s.partnerStatus === "pending" ? "current" : "locked";
    const live: StepState = s.role === "driver" ? "done" : "locked";

    // Video KYC and Pricing are future phases — always shown locked for now.
    return [vehicle, documents, bank, review, "locked", "locked", finalReview, live];
  }

  // Already an approved driver — nothing more to do here.
  if (status.role === "driver") {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-black mb-1">Partner status</h1>
          <p className="text-neutral-500 mb-8">Complete all steps to activate your account</p>
          <div className="bg-white rounded-2xl p-6 mb-6">
            <PartnerStepper states={stepperStates()} />
          </div>
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
          </div>
        </div>
      </main>
    );
  }

  // Application submitted, waiting on admin.
  if (status.partnerStatus === "pending") {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-black mb-1">Partner status</h1>
          <p className="text-neutral-500 mb-8">Complete all steps to activate your account</p>
          <div className="bg-white rounded-2xl p-6 mb-6">
            <PartnerStepper states={stepperStates()} />
          </div>
          <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <p className="font-semibold">Documents Under Review</p>
              <p className="text-sm text-neutral-500">Admin is verifying your documents.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Rejected — let them know, allow resubmission by continuing the wizard.
  const rejectedBanner = status.partnerStatus === "rejected" && (
    <div className="bg-white rounded-2xl p-6 flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
        <XCircle size={18} />
      </div>
      <div>
        <p className="font-semibold">Application rejected</p>
        <p className="text-sm text-neutral-500">
          Please review your details and resubmit below.
        </p>
      </div>
    </div>
  );

  // Still filling out the wizard.
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-16">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl font-black mb-1">Become a Partner</h1>
        <p className="text-neutral-500 mb-6">Complete all steps to activate your account</p>
        <div className="bg-white rounded-2xl p-6">
          <PartnerStepper states={stepperStates()} />
        </div>
      </div>

      {rejectedBanner}

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
          />
        )}
        {step === "bank" && (
          <BankStep
            onBack={() => setStep("documents")}
            onNext={() => {
              refreshStatus();
              setStep("review");
            }}
          />
        )}
        {step === "review" && (
          <ReviewStep onBack={() => setStep("bank")} onSubmitted={refreshStatus} />
        )}
      </div>
    </main>
  );
}