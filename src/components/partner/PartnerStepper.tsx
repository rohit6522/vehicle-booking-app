import { Check, Lock } from "lucide-react";
import { motion } from "framer-motion";
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

                           <motion.div
                animate={{
                  backgroundColor: state === "done" ? "#000000" : "#ffffff",
                  borderColor: state === "done" || state === "current" ? "#000000" : "#e5e5e5",
                  scale: state === "done" ? [0.8, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 ${
                  state === "done"
                    ? "text-white"
                    : state === "current"
                    ? "text-black"
                    : "text-neutral-300"
                }`}
              >
                {state === "done" ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.25, ease: "backOut" }}
                  >
                    <Check size={16} />
                  </motion.div>
                ) : state === "locked" ? (
                  <Lock size={14} />
                ) : (
                  <span className="text-sm font-bold">{i + 1}</span>
                )}
              </motion.div>

              <span
                className={`text-xs mt-2 text-center ${
                  state === "locked" ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                {label}
              </span>
            </div>
                       {i < STEPS.length - 1 && (
              <motion.div
                animate={{ backgroundColor: state === "done" ? "#000000" : "#e5e5e5" }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="h-px flex-1 mt-[-20px]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}