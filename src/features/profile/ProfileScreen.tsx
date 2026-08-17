'use client';

import { useState, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, LogOut, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuthMessage } from '@/components/auth/AuthComponents';
import { Screen } from '@/components/ui/Screen';
import { useAppLanguage } from '@/i18n/I18nProvider';
import { languages, type AppLanguage } from '@/i18n';
import { useAuthStore } from '@/store/useAuthStore';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/profile/ProfileScreen.tsx.
 *
 * Sections kept in mobile's order: header + sign-out, identity card with the
 * verified badge, Basic Details form (email read-only), Language switcher,
 * support note.
 *
 * Deviations:
 *  - No `restartRequired` notice. That existed only because RN's
 *    `I18nManager.forceRTL` needs an app restart; the web flips direction live,
 *    so `profile.restartRequired` is intentionally unused here.
 *  - Mobile applies an `rtl && styles.rtlText` override per element. The web
 *    inherits direction from `<html dir>`, so those overrides are unnecessary.
 */
const ProfileInput = ({
  label,
  value,
  onChange,
  placeholder,
  Icon,
  readOnly,
  type
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  readOnly?: boolean;
  type?: string;
}) => {
  const id = `profile-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12.5px] font-black text-kaam-navy">
        {label}
      </label>
      <div
        className={cn(
          'flex h-[46px] flex-row items-center gap-2 rounded-[13px] border border-kaam-line px-3',
          readOnly ? 'bg-kaam-surface' : 'bg-[#FFFEFB] focus-within:border-kaam-amber'
        )}
      >
        <Icon size={17} className="shrink-0 text-[#8A6A16]" strokeWidth={2.1} aria-hidden />
        <input
          id={id}
          type={type ?? 'text'}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold outline-none placeholder:text-[#9CA3AF]',
            readOnly ? 'text-kaam-muted' : 'text-kaam-navy'
          )}
        />
      </div>
    </div>
  );
};

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, setLanguage } = useAppLanguage();

  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const signOut = useAuthStore((state) => state.signOut);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  // `draft` is null until the customer edits something, so the fields simply
  // display the current profile. Mobile instead copies the profile into state
  // from an effect, which both triggers a cascading render and goes stale if
  // the profile reloads while the screen is open.
  const [draft, setDraft] = useState<{ fullName: string; phone: string; city: string } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const form = draft ?? {
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? ''
  };

  const edit = (patch: Partial<typeof form>) => setDraft({ ...form, ...patch });

  const save = async () => {
    setMessage('');
    setError('');
    try {
      await updateProfile({
        full_name: form.fullName,
        phone: form.phone,
        city: form.city
      });
      // Drop the draft so the fields re-derive from the saved profile.
      setDraft(null);
      setMessage(t('profile.updated'));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('profile.updateFailed'));
    }
  };

  const pickLanguage = async (next: AppLanguage) => {
    await setLanguage(next);
    setMessage(t('profile.languageChanged'));
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace(routes.login());
    router.refresh();
  };

  // Unauthenticated visitors never reach this route — src/proxy.ts redirects
  // them — so mobile's guest branch has no web equivalent.
  if (!session) return null;

  return (
    <Screen width="narrow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-kaam-muted">
            {t('profile.eyebrow')}
          </p>
          <h1 className="text-2xl font-extrabold text-kaam-navy">{t('profile.title')}</h1>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleSignOut()}
          aria-label={t('profile.logout')}
          className="flex h-10 items-center gap-2 rounded-2xl border border-kaam-line bg-white px-4 text-xs font-extrabold text-kaam-navy transition-colors hover:border-kaam-red hover:text-kaam-red disabled:opacity-50"
        >
          <LogOut size={16} aria-hidden />
          {loading ? t('profile.loggingOut') : t('profile.logout')}
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <AuthMessage text={message} tone="success" />
        <AuthMessage text={error} />

        <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <p className="text-lg font-extrabold text-kaam-navy">
            {form.fullName || t('profile.customerAccount')}
          </p>
          <p className="mt-0.5 text-sm text-kaam-muted">
            {session.user.email || t('profile.customerAccount')}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF3] px-3 py-1 text-[11px] font-extrabold text-kaam-green">
            <ShieldCheck size={13} aria-hidden />
            {t('profile.verified')}
          </p>
        </section>

        <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <h2 className="text-sm font-extrabold text-kaam-navy">{t('profile.basicDetails')}</h2>
          <div className="mt-4 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
            <ProfileInput
              label={t('profile.fullName')}
              value={form.fullName}
              onChange={(fullName) => edit({ fullName })}
              placeholder={t('profile.fullNamePlaceholder')}
              Icon={User}
            />
            <ProfileInput
              label={t('profile.email')}
              value={session.user.email ?? ''}
              placeholder={t('auth.signup.emailPlaceholder')}
              Icon={Mail}
              readOnly
            />
            <ProfileInput
              label={t('profile.phone')}
              value={form.phone}
              onChange={(phone) => edit({ phone })}
              placeholder={t('profile.phonePlaceholder')}
              Icon={Phone}
              type="tel"
            />
            <ProfileInput
              label={t('profile.city')}
              value={form.city}
              onChange={(city) => edit({ city })}
              placeholder={t('profile.cityPlaceholder')}
              Icon={Building2}
            />
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => void save()}
            className="mt-5 h-12 rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-50"
          >
            {loading ? t('common.saving') : t('common.saveChanges')}
          </button>
        </section>

        <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <h2 className="text-sm font-extrabold text-kaam-navy">{t('profile.language')}</h2>
          <p className="mt-0.5 text-xs text-kaam-muted">{t('profile.languageSubtitle')}</p>
          <div className="mt-4 flex gap-3">
            {languages.map((option) => {
              const active = option.code === language;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => void pickLanguage(option.code)}
                  aria-pressed={active}
                  className={cn(
                    'flex-1 rounded-2xl border px-4 py-3 text-sm font-extrabold transition-colors',
                    active
                      ? 'border-kaam-amber bg-kaam-yellow/15 text-kaam-navy'
                      : 'border-kaam-line bg-white text-kaam-muted hover:border-kaam-amber'
                  )}
                >
                  {option.nativeLabel}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl2 border border-kaam-line bg-kaam-surface p-5">
          <h2 className="text-sm font-extrabold text-kaam-navy">{t('profile.supportTitle')}</h2>
          <p className="mt-1 text-xs leading-relaxed text-kaam-muted">{t('profile.supportText')}</p>
        </section>
      </div>
    </Screen>
  );
};
