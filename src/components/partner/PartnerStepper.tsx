import { Check, Lock } from "lucide-react";

const STEPS = [
  "Vehicle",
  "Documents",
  "Bank",
  "Review",
  "Video KYC",
  "Pricing",
  "Final Review",
  "Live",
];

export type StepState = "done" | "current" | "locked";

export function PartnerStepper({ states }: { states: StepState[] }) {
  return (
    <div className="flex items-start justify-between overflow-x-auto pb-2">
      {STEPS.map((label, i) => {
        const state = states[i] ?? "locked";
        return (
          <div key={label} className="flex items-center flex-1 min-w-[80px]">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 ${
                  state === "done"
                    ? "bg-black border-black text-white"
                    : state === "current"
                    ? "border-black text-black bg-white"
                    : "border-neutral-200 text-neutral-300 bg-white"
                }`}
              >
                {state === "done" ? (
                  <Check size={16} />
                ) : state === "locked" ? (
                  <Lock size={14} />
                ) : (
                  <span className="text-sm font-bold">{i + 1}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center ${
                  state === "locked" ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 mt-[-20px] ${
                  state === "done" ? "bg-black" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}