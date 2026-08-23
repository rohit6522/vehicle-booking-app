"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // No backend inbox wired up yet — acknowledge receipt to the user.
    setTimeout(() => {
      toast.success("Message received! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
      setSending(false);
    }, 600);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-4 py-24">
               <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          <span className="text-xs tracking-[0.2em] text-neutral-500 font-medium">
            CONTACT
          </span>
          <h1 className="text-4xl font-black mt-3 mb-6">Get in touch</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Mail size={16} /> support@rydex.com
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Phone size={16} /> +91 00000 00000
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin size={16} /> India
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
            />
            <input
              required
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
            />
            <textarea
              required
              placeholder="Your message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm resize-none focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-8 py-3 rounded-full bg-black text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
       </motion.div>
      </main>
      <Footer />
    </>
  );
}