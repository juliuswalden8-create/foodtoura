import Image from "next/image";
import { LocationSearch } from "@/components/LocationSearch";

export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[calc(100dvh-4rem)]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&q=80"
            alt="Candlelit restaurant table with seasonal dishes"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/85 to-cream/40 sm:bg-gradient-to-r sm:from-cream sm:via-cream/90 sm:to-cream/20" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:justify-center sm:px-6 sm:pb-20 sm:pt-12">
          <div className="max-w-xl">
            <p className="animate-fade-up font-display text-sm font-medium tracking-[0.08em] text-terracotta">
              FoodToura
            </p>
            <h1
              className="animate-fade-up mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-forest text-balance sm:text-5xl lg:text-[3.4rem]"
              style={{ animationDelay: "40ms" }}
            >
              A new city. A thousand restaurants. One perfect match.
            </h1>
            <p
              className="animate-fade-up mt-5 max-w-md text-base leading-relaxed text-charcoal-soft sm:text-lg"
              style={{ animationDelay: "80ms" }}
            >
              Tell us what you love, what you need and who you&apos;re traveling
              with. We&apos;ll help you discover restaurants that fit your
              journey.
            </p>
            <div className="mt-8">
              <LocationSearch />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-forest sm:text-4xl">
            Feel like a local food guide
          </h2>
          <p className="mt-3 text-charcoal-soft">
            Personalized discovery — not a generic directory. We rank by your
            taste, group, budget, distance, and dietary needs, with allergy
            safety labeled clearly at every step.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Your journey",
              body: "City, neighborhood, distance and how you get there — walking, transit, or driving.",
            },
            {
              title: "Your taste",
              body: "Cuisines, atmosphere, budget, and free-text prefs turned into structured matches.",
            },
            {
              title: "Your safety",
              body: "All 14 EU allergens, severity levels, and restaurant-provided vs unverified labeling.",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-3 h-1 w-10 rounded-full bg-terracotta" />
              <h3 className="font-display text-xl font-semibold text-forest">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
