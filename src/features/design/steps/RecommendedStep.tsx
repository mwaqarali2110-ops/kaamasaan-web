'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { WizardShell } from '../WizardShell';
import { STEP_TITLES, getInverterSizeKw } from '../wizard';
import type { StepProps } from './types';

/**
 * Step 7 — ported from `RecommendedSystemStepScreen`.
 *
 * Mobile derives `inverterSize` from `getInverterSizeKw(round(solarKw))` and
 * shows the battery only when the customer chose backup; identical here. The
 * numbers and that branch are untouched — this is a visual pass only: the
 * flat icon row is replaced with the same real equipment photography used on
 * the backup-need step (Longi panel, Sungrow inverter, Sungrow battery), the
 * card gets a softer gradient/glow treatment instead of a plain white box,
 * and everything enters with a short staggered fade so the "ready" moment
 * reads as a reveal rather than a static dump of numbers.
 */
export const RecommendedStep = ({ onContinue, onBack }: StepProps) => {
  const recommendedSolarKw = useSystemStore((state) => state.recommendedSolarKw);
  const backupDecision = useSystemStore((state) => state.backupDecision);
  const selectedBatteryKwh = useSystemStore((state) => state.selectedBatteryKwh);

  const solarSize = Math.round(recommendedSolarKw || 3);
  const inverterSize = getInverterSizeKw(solarSize);
  const hasBattery = backupDecision === 'yes' && Boolean(selectedBatteryKwh);
  const batterySize = hasBattery ? selectedBatteryKwh : 0;

  const equipment = [
    {
      key: 'panels',
      image: '/marketing/equipment/longi-panel.png',
      value: `${solarSize} kW`,
      label: 'Solar Panels',
      caption: 'Longi Hi-MO X10'
    },
    {
      key: 'inverter',
      image: '/marketing/equipment/sungrow-inverter.jpg',
      value: `${inverterSize} kW`,
      label: 'Inverter',
      caption: 'Sungrow HV Hybrid'
    },
    {
      key: 'battery',
      image: '/marketing/equipment/sungrow-battery.webp',
      value: hasBattery ? `${batterySize} kWh` : 'Not included',
      label: 'Battery',
      caption: hasBattery ? 'Sungrow HV Battery' : undefined,
      muted: !hasBattery
    }
  ] as const;

  return (
    <WizardShell
      step="recommended"
      title={STEP_TITLES.recommended}
      onBack={onBack}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="h-12 w-full rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber lg:w-auto lg:px-8"
        >
          Explore Packages
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kaam-green/10 px-3 py-1 text-[11px] font-bold text-kaam-green">
            <CheckCircle2 size={13} strokeWidth={2.5} aria-hidden />
            System sized &amp; ready
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-kaam-navy">
            Your Recommended Solar System is Ready
          </h2>
          <p className="mt-1 text-sm text-kaam-muted">
            Based on your selected appliances, load and usage
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-kaam-line bg-gradient-to-br from-white via-white to-kaam-surface p-6 shadow-lg sm:p-8"
        >
          {/* Soft decorative glow — purely atmospheric, no layout impact. */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-kaam-yellow/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-kaam-green/10 blur-3xl"
            aria-hidden
          />

          <div className="relative grid gap-8 md:grid-cols-[minmax(0,1.1fr)_1px_minmax(0,1fr)] md:items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
              className="relative mx-auto h-48 w-full max-w-xs md:mx-0 md:h-56"
            >
              <Image
                src="/assets/home/transparent-solar-house-hero-section.png"
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-contain drop-shadow-xl"
              />
            </motion.div>

            <div
              className="hidden h-full bg-gradient-to-b from-transparent via-kaam-line to-transparent md:block"
              aria-hidden
            />

            <dl className="flex flex-col gap-3">
              {equipment.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut', delay: 0.3 + index * 0.1 }}
                  className={
                    item.muted
                      ? 'flex items-center gap-3 rounded-2xl border border-dashed border-kaam-line bg-white/40 p-3'
                      : 'flex items-center gap-3 rounded-2xl border border-kaam-line/70 bg-white/80 p-3 shadow-sm backdrop-blur-sm'
                  }
                >
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-kaam-line bg-white p-1.5">
                    <Image
                      src={item.image}
                      alt=""
                      width={48}
                      height={48}
                      className={item.muted ? 'h-full w-full object-contain opacity-40 grayscale' : 'h-full w-full object-contain'}
                    />
                  </span>
                  <span className="min-w-0">
                    <dd
                      className={
                        item.muted
                          ? 'text-base font-extrabold text-kaam-muted'
                          : 'text-lg font-extrabold text-kaam-navy'
                      }
                    >
                      {item.value}
                    </dd>
                    <dt className="text-[11px] text-kaam-muted">
                      {item.label}
                      {item.caption ? ` · ${item.caption}` : ''}
                    </dt>
                  </span>
                </motion.div>
              ))}
            </dl>
          </div>
        </motion.div>
      </div>
    </WizardShell>
  );
};
