"use client";

import { useState } from "react";
import { UploadCloud, Check } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

const DOCS = [
  { key: "aadhaarUrl", label: "Aadhaar / ID Proof", desc: "Government issued ID" },
  { key: "licenseUrl", label: "Driving License", desc: "Valid driving license" },
  { key: "rcUrl", label: "Vehicle RC", desc: "Registration Certificate" },
] as const;

type DocKey = (typeof DOCS)[number]["key"];

export function DocumentsStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const [urls, setUrls] = useState<Record<DocKey, string>>({
    aadhaarUrl: "",
    licenseUrl: "",
    rcUrl: "",
  });
  const [uploadingKey, setUploadingKey] = useState<DocKey | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFile(key: DocKey, file: File | null) {
    if (!file) return;
    setError("");
    setUploadingKey(key);
    try {
      const url = await uploadToCloudinary(file);
      setUrls((prev) => ({ ...prev, [key]: url }));
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleContinue() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(urls),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      onNext();
    } finally {
      setLoading(false);
    }
  }

  const allUploaded = DOCS.every((d) => urls[d.key]);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
      <button onClick={onBack} className="text-sm text-neutral-400 mb-4">
        ← Back
      </button>
      <p className="text-center text-xs text-neutral-400 mb-1">Step 2 of 3</p>
      <h2 className="text-center text-2xl font-black mb-1">Upload Documents</h2>
      <p className="text-center text-sm text-neutral-500 mb-6">
        Required for verification
      </p>

      <div className="space-y-3 mb-4">
        {DOCS.map((doc) => (
          <label
            key={doc.key}
            className="flex items-center justify-between border border-neutral-200 rounded-xl px-4 py-3 cursor-pointer hover:border-neutral-400"
          >
            <div>
              <p className="text-sm font-semibold">{doc.label}</p>
              <p className="text-xs text-neutral-400">{doc.desc}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
              {uploadingKey === doc.key ? (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : urls[doc.key] ? (
                <Check size={16} />
              ) : (
                <UploadCloud size={16} />
              )}
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFile(doc.key, e.target.files?.[0] ?? null)}
            />
          </label>
        ))}
      </div>

      <p className="text-xs text-neutral-400 mb-4">
        Documents are securely stored and manually verified by our team.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <button
        onClick={handleContinue}
        disabled={!allUploaded || loading}
        className="w-full py-3.5 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
      >
        {loading ? "Saving..." : "Continue →"}
      </button>
    </div>
  );
}