import type { Metadata } from "next";
import { LegalDraftBanner } from "@/components/LegalDraft";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <LegalDraftBanner />
      <h1 className="font-display text-4xl font-semibold text-[#344E41]">
        Privacy policy
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#303A32]">
        <p>
          FoodToura may store guest preferences, saved restaurants and optional
          allergy cards in your browser&apos;s local storage. Server-side
          discovery requests send destination and preference fields to our API
          routes to query restaurant providers.
        </p>
        <p>
          Allergy and health-related information should be treated as sensitive.
          Storage is optional. We do not sell personal data.
        </p>
        <p>
          When Google Places (or other providers) are enabled, their privacy
          terms also apply to data sent to those services.
        </p>
        <p>
          [Client legal entity, DPO contact, retention periods and GDPR rights
          language to be inserted after client approval.]
        </p>
      </div>
    </div>
  );
}
