'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { routes } from '@/constants/routes';
import { CardTrack, CategoryCard } from '@/features/home/sections';
import { MARKETPLACE_CATEGORIES, SERVICES } from '@/features/home/homeContent';
import { journeySteps } from '@/features/support/howItWorksContent';

/**
 * Public marketing landing page at /welcome — the site's unauthenticated
 * entry point. Redesigned per a supplied reference photo + written layout
 * spec (nav / split hero / card sections); it is not a mobile screen port,
 * since mobile has no equivalent desktop marketing homepage — its
 * `OnboardingScreen` is a single centred "Get Started" card, not a nav +
 * hero + content page.
 *
 * The three card sections reuse the exact data + `CategoryCard`/`CardTrack`
 * building blocks already ported for the Home screen (`homeContent.ts`,
 * `sections.tsx`) and the How It Works step data (`howItWorksContent.ts`),
 * rather than inventing new copy or new card components.
 */
const NAV_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Home', href: routes.welcome() },
  { label: 'How it works', href: routes.howItWorks() },
  { label: 'Services', href: '#services' },
  { label: 'Marketplace', href: routes.marketplace() },
  { label: 'The app', href: routes.login() }
];

export const WelcomeScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const setHasSeenOnboarding = useAppStore((state) => state.setHasSeenOnboarding);
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (href: string) => {
    setHasSeenOnboarding(true);
    setMenuOpen(false);
    router.push(href);
  };

  return (
    <main className="min-h-screen bg-kaam-cream">
      <header className="sticky top-0 z-40 border-b border-kaam-line bg-kaam-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href={routes.welcome()} className="text-lg font-extrabold text-kaam-navy">
            {t('common.appName')}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-bold text-kaam-navy transition-colors hover:text-[#FFA500]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => goTo(routes.design())}
            className="hidden h-11 items-center gap-2 rounded-full bg-[#FFA500] px-5 text-sm font-extrabold text-kaam-navy transition-colors hover:bg-[#e69400] lg:flex"
          >
            Design your system
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-kaam-navy lg:hidden"
          >
            {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-kaam-line bg-kaam-cream px-4 pb-4 lg:hidden">
            <nav className="flex flex-col gap-1 pt-2" aria-label="Primary mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-bold text-kaam-navy hover:bg-kaam-surface"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => goTo(routes.design())}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FFA500] text-sm font-extrabold text-kaam-navy"
            >
              Design your system
            </button>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-20">
          <div>
            <h1 className="text-[38px] font-extrabold leading-[1.08] text-kaam-navy sm:text-[46px] lg:text-[56px]">
              Solar, <span className="text-[#FFA500]">Made Simple</span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-kaam-muted sm:text-lg">
              Design, compare and manage your complete solar system — everything in one smart
              place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => goTo(routes.design())}
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#FFA500] px-7 text-base font-extrabold text-kaam-navy transition-colors hover:bg-[#e69400]"
              >
                Design your system
                <ArrowRight size={20} className="rtl:rotate-180" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => goTo(routes.marketplace())}
                className="flex h-14 items-center justify-center gap-2 rounded-full border-2 border-kaam-navy px-7 text-base font-extrabold text-kaam-navy transition-colors hover:bg-kaam-navy hover:text-white"
              >
                Explore Marketplace
              </button>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="/assets/marketing/hero-installation.png"
              alt="A modern home with a rooftop solar array, battery storage and an EV charging in the driveway"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="hidden justify-center pb-10 md:flex">
          <a
            href="#how-it-works"
            className="flex flex-col items-center gap-1 text-xs font-extrabold uppercase tracking-[0.2em] text-kaam-muted transition-colors hover:text-[#FFA500]"
          >
            Scroll to explore
            <ChevronDown size={18} className="animate-bounce" aria-hidden />
          </a>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-kaam-navy sm:text-3xl">How it works</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-kaam-muted">
            A simple guided journey from your appliances to an installed system.
          </p>
        </div>

        <div className="mt-8">
          <CardTrack columns="md:grid-cols-4">
            {journeySteps.slice(0, 4).map((step, index) => (
              <div
                key={step.step}
                className="w-[220px] shrink-0 snap-start rounded-2xl border border-kaam-line bg-kaam-card p-5 md:w-auto"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFA500]/15 text-sm font-extrabold text-[#FFA500]">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm font-extrabold text-kaam-navy">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-kaam-muted">{step.description}</p>
              </div>
            ))}
          </CardTrack>
        </div>

        <div className="mt-8 text-center">
          <Link
            href={routes.howItWorks()}
            className="inline-flex items-center gap-1 text-sm font-extrabold text-[#FFA500] hover:underline"
          >
            See the full journey
            <ArrowRight size={16} className="rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </section>

      <section id="services" className="border-t border-kaam-line bg-kaam-surface/60 px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-kaam-navy sm:text-3xl">Services</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-kaam-muted">
              Cleaning, installation, electrical work and net billing — handled end to end.
            </p>
          </div>

          <div className="mt-8">
            <CardTrack columns="md:grid-cols-4">
              {SERVICES.map((service) => (
                <CategoryCard key={service.id} item={service} />
              ))}
            </CardTrack>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-kaam-navy sm:text-3xl">Marketplace</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-kaam-muted">
            Compare inverters, panels, batteries and accessories from trusted brands.
          </p>
        </div>

        <div className="mt-8">
          <CardTrack columns="md:grid-cols-4">
            {MARKETPLACE_CATEGORIES.map((category) => (
              <CategoryCard key={category.id} item={category} />
            ))}
          </CardTrack>
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => goTo(routes.marketplace())}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-kaam-navy px-6 text-sm font-extrabold text-white hover:bg-[#0a1830]"
          >
            Explore Marketplace
            <ArrowRight size={18} className="rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </section>

      <footer className="border-t border-kaam-line px-4 py-8 text-center md:px-6">
        <p className="text-sm font-extrabold text-kaam-navy">{t('common.appName')}</p>
        <p className="mt-1 text-xs text-kaam-muted">
          © {new Date().getFullYear()} KaamAsaan. All rights reserved.
        </p>
      </footer>
    </main>
  );
};
