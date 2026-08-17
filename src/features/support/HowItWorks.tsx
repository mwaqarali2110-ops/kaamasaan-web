'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, X, Zap } from 'lucide-react';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';
import { journeySteps, type JourneyStep, type JourneyStepPreview } from './howItWorksContent';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/support/HowItWorksScreen.tsx.
 *
 * All 8 steps, their titles and descriptions are reproduced exactly from
 * `journeySteps`. The per-step preview illustrations are simplified — mobile
 * draws eight bespoke mini-mockups (an appliance list, an SVG production
 * curve, a panel grid, a battery card, package chips, form skeletons, a
 * tracking timeline); this keeps the same visual language (icon + label) in
 * one reusable component rather than porting each illustration one for one,
 * since they are decorative rather than informational.
 */
const MiniRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-center gap-2 py-1">
    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-kaam-amber" />
    <span className="flex-1 text-xs font-semibold text-kaam-navy">{label}</span>
    {value ? <span className="text-xs font-extrabold text-kaam-muted">{value}</span> : null}
  </div>
);

const StepPreview = ({ type, large = false }: { type: JourneyStepPreview; large?: boolean }) => (
  <div className={cn('rounded-xl bg-kaam-surface p-3', large && 'p-4')}>
    {type === 'appliances' ? (
      <>
        <MiniRow label="LED Bulbs" value="2" />
        <MiniRow label="Fans" value="3" />
        <MiniRow label="Refrigerator" value="1" />
      </>
    ) : null}

    {type === 'solar' ? (
      <svg viewBox="0 0 180 76" className="h-auto w-full">
        <path
          d="M20 58 C42 54 52 28 76 24 C104 18 112 18 136 31 C152 40 158 50 164 56"
          fill="none"
          stroke="#F5A400"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle cx={104} cy={21} r={5} fill="#F5A400" />
      </svg>
    ) : null}

    {type === 'panel' ? (
      <div className="grid grid-cols-2 gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-6 rounded bg-white" />
        ))}
      </div>
    ) : null}

    {type === 'backup' ? (
      <>
        <MiniRow label="Fans" value="3 hrs" />
        <MiniRow label="WiFi Router" value="4 hrs" />
        <MiniRow label="Lights" value="2 hrs" />
      </>
    ) : null}

    {type === 'battery' ? (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-extrabold text-kaam-navy">10 kWh</p>
          <p className="text-[11px] text-kaam-muted">Battery System</p>
        </div>
        <CheckCircle2 size={22} className="text-[#D99A00]" strokeWidth={2.4} aria-hidden />
      </div>
    ) : null}

    {type === 'packages' ? (
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-lg bg-white" />
        <div className="h-10 flex-1 rounded-lg border-2 border-kaam-amber bg-white" />
        <div className="h-10 flex-1 rounded-lg bg-white" />
      </div>
    ) : null}

    {type === 'survey' ? (
      <>
        <div className="mb-1.5 h-8 rounded-lg bg-white" />
        <div className="mb-1.5 h-8 rounded-lg bg-white" />
        <div className="h-8 w-2/3 rounded-lg bg-white" />
      </>
    ) : null}

    {type === 'tracking' ? (
      <>
        {['Survey booked', 'Team confirmation', 'Installation'].map((item, index) => (
          <div key={item} className="flex items-center gap-2 py-1">
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                index === 0 ? 'bg-kaam-amber' : 'bg-kaam-line'
              )}
            />
            <span className="text-xs font-semibold text-kaam-navy">{item}</span>
          </div>
        ))}
      </>
    ) : null}
  </div>
);

export const HowItWorks = () => {
  const [selectedStep, setSelectedStep] = useState<JourneyStep | null>(null);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-8 md:px-6">
      <div className="py-6 text-center">
        <h1 className="text-[28px] font-extrabold tracking-tight text-kaam-navy">How it works</h1>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-kaam-muted">
          Follow a simple guided journey to design the right solar system for your home.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-kaam-line bg-white p-3.5 shadow-sm">
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-2xl bg-kaam-yellow">
          <Zap size={17} className="text-kaam-navy" strokeWidth={2.5} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-extrabold text-kaam-navy">Why this journey matters</p>
          <p className="mt-1 text-xs leading-[17px] text-kaam-muted">
            KaamAsaan calculates your daytime load, roof space, backup need, and package options
            before you book a survey, so you can make an informed solar decision.
          </p>
        </div>
      </div>

      <ol className="relative mt-5 flex flex-col gap-3 ps-7">
        <span className="absolute inset-y-5 start-[13px] w-0.5 rounded-full bg-[#F3D27A]" aria-hidden />
        {journeySteps.map((item, index) => (
          <li key={item.step} className="relative">
            <span className="absolute -start-7 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-kaam-navy text-[11px] font-extrabold text-white">
              {index + 1}
            </span>
            <button
              type="button"
              onClick={() => setSelectedStep(item)}
              className="w-full rounded-2xl border border-kaam-line bg-white p-3.5 text-start shadow-sm transition-colors hover:border-kaam-amber md:grid md:grid-cols-[1fr_160px] md:items-center md:gap-4"
            >
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-kaam-amber">
                  {item.step} · {item.label}
                </p>
                <p className="mt-1 text-base font-extrabold text-kaam-navy">{item.title}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#D99A00]">
                  See preview
                  <ArrowRight size={15} strokeWidth={2.6} className="rtl:rotate-180" aria-hidden />
                </p>
              </div>
              <div className="mt-3 hidden md:mt-0 md:block">
                <StepPreview type={item.preview} />
              </div>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-2xl border border-kaam-line bg-white p-5 text-center shadow-sm">
        <p className="text-lg font-extrabold text-kaam-navy">Ready to design your system?</p>
        <p className="mt-1 text-sm text-kaam-muted">
          Start the actual Design Your System journey when you are ready.
        </p>
        <Link
          href={routes.design()}
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
        >
          Start Design Journey
          <ArrowRight size={18} strokeWidth={2.6} className="rtl:rotate-180" aria-hidden />
        </Link>
      </div>

      {selectedStep ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kaam-navy/35 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedStep(null)}
        >
          <div
            className="w-full max-w-sm rounded-[22px] border border-kaam-line bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-kaam-amber">
                  {selectedStep.step}
                </p>
                <p className="text-lg font-extrabold text-kaam-navy">{selectedStep.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-kaam-muted hover:bg-kaam-surface"
              >
                <X size={18} strokeWidth={2.5} aria-hidden />
              </button>
            </div>

            <div className="mt-3">
              <StepPreview type={selectedStep.preview} large />
            </div>

            <p className="mt-3 text-sm leading-relaxed text-kaam-muted">
              {selectedStep.description}
            </p>

            <Link
              href={routes.design()}
              className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
            >
              Start this journey
              <ArrowRight size={17} strokeWidth={2.6} className="rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
};
