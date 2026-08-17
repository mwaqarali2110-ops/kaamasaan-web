'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Home as HomeIcon, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { openSupportWhatsApp } from '@/services/notifications.api';
import { routes } from '@/constants/routes';
import { HomeStatusBars } from './HomeStatusBars';
import {
  BrandMarquee,
  CardTrack,
  CategoryCard,
  DesignSystemCta,
  ExpertBenefitRow,
  SectionHeader
} from './sections';
import {
  EXPERT_WHATSAPP_MESSAGE,
  MARKETPLACE_CATEGORIES,
  QUICK_ACTIONS,
  SERVICES,
  WHY_ITEMS
} from './homeContent';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/home/HomeScreen.tsx.
 *
 * Section order is mobile's exactly:
 *   1 Hero + Design System CTA
 *   2 Trusted brands marquee
 *   3 Smart tools
 *   4 Preventive maintenance banner
 *   5 Explore products
 *   6 Services
 *   7 Expert consultation
 *
 * The header (menu / logo / bell) is not repeated here: on web those live in
 * the persistent TopBar and sidebar, which is the whole point of the desktop
 * shell. The continue-plan and active-journey bars render above the hero via
 * HomeStatusBars (added in Phase 7 once their data hooks were needed).
 */
export const HomeScreen = () => {
  const { t } = useTranslation();

  return (
    <Screen width="wide">
      <HomeStatusBars />

      {/* 1 ── Hero */}
      <section className="overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
        <div className="grid items-center gap-6 p-6 md:grid-cols-2 md:p-8">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-kaam-navy md:text-3xl">
              {t('home.heroTitle')}
            </h1>
            <p className="mt-2 text-sm text-kaam-muted md:text-base">{t('home.heroSubtitle')}</p>

            <ul className="mt-5 flex flex-col gap-2.5">
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kaam-yellow/25">
                  <Zap size={12} className="text-[#B07800]" fill="#B07800" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-kaam-navy">
                  {t('home.estimateLoad')}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kaam-green/10">
                  <HomeIcon size={12} className="text-kaam-green" strokeWidth={2.4} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-kaam-navy">
                  {t('home.designSystem')}
                </span>
              </li>
            </ul>

            <div className="mt-6">
              <DesignSystemCta href={routes.design()} />
            </div>
          </div>

          <div className="relative h-56 md:h-72">
            <Image
              src="/assets/home/transparent-solar-house-hero-section.png"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* 2 ── Trusted brands */}
      <BrandMarquee />

      {/* 3 ── Smart tools */}
      <SectionHeader title={t('home.smartTools')} />
      <CardTrack columns="md:grid-cols-3 lg:grid-cols-5">
        {QUICK_ACTIONS.map(({ id, labelKey, Icon, href }) => (
          <Link
            key={id}
            href={href}
            className="flex w-[132px] shrink-0 snap-start flex-col items-center gap-2 rounded-xl2 border border-kaam-line bg-kaam-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-kaam-amber hover:shadow-md md:w-auto"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-kaam-yellow/20">
              <Icon size={19} className="text-[#B07800]" strokeWidth={1.9} aria-hidden />
            </span>
            <span className="text-xs font-extrabold leading-tight text-kaam-navy">
              {t(labelKey)}
            </span>
          </Link>
        ))}
      </CardTrack>

      {/* 4 ── Preventive maintenance */}
      <Link
        href={routes.preventiveMaintenance()}
        className="group relative mt-8 flex h-44 items-end overflow-hidden rounded-xl2 border border-kaam-line md:h-52"
      >
        <Image
          src="/assets/home/solar-care.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="relative p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-kaam-yellow">
            {t('services.solarCare')}
          </p>
          <p className="mt-1 text-lg font-extrabold text-white">
            {t('services.preventiveMaintenance')}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-kaam-yellow px-3 py-1.5 text-[11px] font-extrabold text-[#201503]">
            {t('tools.checkSolarHealth')}
            <ChevronRight size={11} strokeWidth={2.8} className="rtl:rotate-180" aria-hidden />
          </span>
        </div>
      </Link>

      {/* 5 ── Explore products */}
      <SectionHeader
        title={t('home.exploreProducts')}
        action={t('common.viewAll')}
        href={routes.marketplace()}
      />
      <CardTrack columns="md:grid-cols-2 lg:grid-cols-4">
        {MARKETPLACE_CATEGORIES.map((item) => (
          <CategoryCard key={item.id} item={item} />
        ))}
      </CardTrack>

      {/* 6 ── Services */}
      <SectionHeader
        title={t('home.services')}
        action={t('common.viewAll')}
        href={routes.bookSurvey()}
      />
      <CardTrack columns="md:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((item) => (
          <CategoryCard key={item.id} item={item} />
        ))}
      </CardTrack>

      {/* 7 ── Expert consultation */}
      <section className="mt-8 rounded-xl2 border border-kaam-line bg-kaam-card p-6">
        <h2 className="text-lg font-extrabold text-kaam-navy">{t('home.whyTitle')}</h2>
        <p className="mt-1 text-sm text-kaam-muted">{t('home.whyCopy')}</p>

        <ul className="mt-4 flex flex-col gap-2.5 md:flex-row md:gap-8">
          {WHY_ITEMS.map((item) => (
            <ExpertBenefitRow key={item} label={t(item)} />
          ))}
        </ul>

        <button
          type="button"
          onClick={() => void openSupportWhatsApp(EXPERT_WHATSAPP_MESSAGE)}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl bg-kaam-yellow px-5 text-sm font-extrabold text-[#10233F] transition-colors hover:bg-kaam-amber"
        >
          Get Expert Opinion
          <ArrowRight size={18} strokeWidth={2.5} className="rtl:rotate-180" aria-hidden />
        </button>
      </section>
    </Screen>
  );
};
