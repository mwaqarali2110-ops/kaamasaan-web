'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Mail, MessageCircle, Phone, Search } from 'lucide-react';
import { supportConfig } from '@/constants/support';
import { cn } from '@/lib/cn';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/support/HelpCenterScreen.tsx.
 * Categories, FAQ copy and the search-filter behaviour are reproduced exactly.
 *
 * "Talk to Support" opens a modal on both platforms; on web it is a centred
 * dialog rather than a bottom sheet.
 */
type HelpCategory = {
  id: string;
  title: string;
  description: string;
  faqs?: string[];
  support?: boolean;
};

const helpCategories: HelpCategory[] = [
  {
    id: 'solar-system',
    title: 'Solar System Help',
    description: 'Get help with system sizing, load calculation, and package selection.',
    faqs: [
      'How do I calculate my load?',
      'How do I know which system size is right?',
      'Can I compare different brands?'
    ]
  },
  {
    id: 'booking-survey',
    title: 'Booking & Survey Help',
    description: 'Questions about survey booking, visit confirmation, or project progress.',
    faqs: [
      'How do I book a survey?',
      'When will your team contact me?',
      'Can I change my survey date?'
    ]
  },
  {
    id: 'marketplace',
    title: 'Marketplace Help',
    description: 'Help with products, prices, brands, and availability.',
    faqs: ['Are prices updated?', 'Are products verified?', 'Can I buy only inverter/panels/battery?']
  },
  {
    id: 'services',
    title: 'Services Help',
    description: 'Support for cleaning, electrical work, installation, and net billing.',
    faqs: [
      'What services are available?',
      'How do I book cleaning or electrical work?',
      'How do I report poor service?'
    ]
  },
  {
    id: 'payment-pricing',
    title: 'Payment & Pricing Help',
    description: 'Understand quotations, prices, and payment-related questions.',
    faqs: ['Is pricing transparent?', 'Are installation charges included?', 'How do quotations work?']
  },
  {
    id: 'talk-support',
    title: 'Talk to Support',
    description: 'Contact KaamAsaan support for further assistance.',
    support: true
  }
];

export const HelpCenter = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  const visibleCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return helpCategories;
    return helpCategories.filter((category) => {
      const faqMatch = category.faqs?.some((faq) => faq.toLowerCase().includes(query));
      return (
        category.title.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        Boolean(faqMatch)
      );
    });
  }, [search]);

  const visibleFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const faqs = selectedCategory?.faqs ?? [];
    if (!query) return faqs;
    return faqs.filter((faq) => faq.toLowerCase().includes(query));
  }, [search, selectedCategory]);

  const openUnavailable = () => window.alert('This support channel will be available soon.');

  const openWhatsApp = () => {
    if (!supportConfig.supportWhatsApp) return openUnavailable();
    window.open(`https://wa.me/${supportConfig.supportWhatsApp}`, '_blank', 'noopener,noreferrer');
  };
  const callSupport = () => {
    if (!supportConfig.supportPhone) return openUnavailable();
    window.location.href = `tel:${supportConfig.supportPhone}`;
  };
  const emailSupport = () => {
    if (!supportConfig.supportEmail) return openUnavailable();
    window.location.href = `mailto:${supportConfig.supportEmail}`;
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-8 md:px-6">
      <div className="rounded-xl2 border border-kaam-line bg-white p-5 shadow-sm">
        <h1 className="text-[25px] font-extrabold text-kaam-navy">
          {selectedCategory?.title ?? 'Help Center'}
        </h1>
        <p className="mt-1 text-sm font-semibold text-kaam-muted">
          {selectedCategory?.description ?? 'How can we help you today?'}
        </p>

        <div className="mt-4 flex h-[50px] items-center gap-2.5 rounded-2xl border border-kaam-line bg-[#FFFEFB] px-3.5">
          <Search size={18} className="shrink-0 text-[#D99A00]" strokeWidth={2.3} aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search help topics"
            aria-label="Search help topics"
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-kaam-navy outline-none placeholder:text-[#94A3B8]"
          />
        </div>
      </div>

      {selectedCategory ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setExpandedFaq(null);
            }}
            className="mb-3 text-xs font-extrabold text-kaam-amber hover:underline"
          >
            ← All topics
          </button>

          {visibleFaqs.length ? (
            <div className="flex flex-col gap-2.5">
              {visibleFaqs.map((faq) => {
                const expanded = expandedFaq === faq;
                return (
                  <button
                    key={faq}
                    type="button"
                    onClick={() => setExpandedFaq(expanded ? null : faq)}
                    aria-expanded={expanded}
                    className="rounded-2xl border border-kaam-line bg-white p-3.5 text-start"
                  >
                    <span className="flex items-center justify-between gap-2.5">
                      <span className="text-[15px] font-extrabold text-kaam-navy">{faq}</span>
                      <ChevronDown
                        size={18}
                        className={cn('shrink-0 text-[#B08900] transition-transform', expanded && 'rotate-180')}
                        aria-hidden
                      />
                    </span>
                    {expanded ? (
                      <span className="mt-2.5 block text-[13px] leading-[19px] text-kaam-muted">
                        Our support team can guide you through this topic. Use Talk to Support if
                        you need personal help.
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 text-center text-sm font-bold text-kaam-muted">
              No FAQ topics found for this search.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {visibleCategories.length ? (
            visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  category.support ? setSupportOpen(true) : (setSelectedCategory(category), setExpandedFaq(null))
                }
                className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-kaam-line bg-white p-3.5 text-start shadow-sm transition-colors hover:border-kaam-amber"
              >
                <span className="h-[46px] w-[5px] shrink-0 rounded-full bg-kaam-yellow" />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-kaam-navy">{category.title}</span>
                  <span className="mt-1 block text-[13px] text-kaam-muted">{category.description}</span>
                </span>
                <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#FFF4D6]">
                  <ChevronRight size={20} className="text-[#D99A00] rtl:rotate-180" strokeWidth={2.5} aria-hidden />
                </span>
              </button>
            ))
          ) : (
            <p className="mt-5 text-center text-sm font-bold text-kaam-muted">
              No help topics found for this search.
            </p>
          )}
        </div>
      )}

      {supportOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kaam-navy/30 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSupportOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[26px] border border-kaam-line bg-kaam-cream p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-extrabold text-kaam-navy">Talk to Support</h2>
            <p className="mt-1 text-[13px] text-kaam-muted">
              Choose how you want to contact KaamAsaan support.
            </p>

            <div className="mt-3.5 flex flex-col gap-2.5">
              {[
                { label: 'WhatsApp Support', Icon: MessageCircle, onClick: openWhatsApp },
                { label: 'Call Support', Icon: Phone, onClick: callSupport },
                { label: 'Email Support', Icon: Mail, onClick: emailSupport }
              ].map(({ label, Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="flex h-14 items-center gap-3 rounded-2xl border border-kaam-line bg-white px-3"
                >
                  <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-[#FFF4D6]">
                    <Icon size={21} className="text-[#D99A00]" strokeWidth={2.4} aria-hidden />
                  </span>
                  <span className="text-[15px] font-extrabold text-kaam-navy">{label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSupportOpen(false)}
              className="mt-2 h-[50px] w-full text-[15px] font-extrabold text-kaam-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
