import type { Metadata } from "next";
import { LegalDraftBanner } from "@/components/LegalDraft";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <LegalDraftBanner />
      <h1 className="font-display text-4xl font-semibold text-[#344E41]">
        Terms of service
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#303A32]">
        <p>
          FoodToura provides restaurant discovery information for travelers. We
          do not guarantee availability, prices, allergen safety or booking
          outcomes. Always verify critical details with the venue.
        </p>
        <p>
          Preview/demo inventory is fictional and labeled. Live listings depend
          on third-party data accuracy.
        </p>
        <p>
          [Governing law, liability caps, acceptable use and company identity to
          be completed by client counsel before publication.]
        </p>
      </div>
    </div>
  );
}
