import type { Metadata } from "next";
import { LegalDraftBanner } from "@/components/LegalDraft";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <LegalDraftBanner />
      <p className="text-sm font-medium text-[#C9856B]">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-[#344E41]">
        We&apos;d love to hear from you
      </h1>
      <p className="mt-4 text-[#62675E]">
        Replace the placeholder below with the client&apos;s verified support
        email and company address before launch.
      </p>
      <div className="mt-8 rounded-[1.5rem] border border-[#E8DFD0] bg-[#FFFDF9] p-6">
        <p className="text-sm font-semibold text-[#344E41]">Support</p>
        <p className="mt-2 text-[#303A32]">
          Email:{" "}
          <span className="font-medium">
            [client-support@example.com — replace]
          </span>
        </p>
        <p className="mt-4 text-sm text-[#62675E]">
          Product feedback and partnership inquiries should use the client&apos;s
          official channels once provided.
        </p>
      </div>
    </div>
  );
}
