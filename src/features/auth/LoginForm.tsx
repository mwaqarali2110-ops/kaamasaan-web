'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { AuthField, AuthMessage } from '@/components/auth/AuthComponents';
import { loginSchema, type LoginForm as LoginFormValues } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/useAuthStore';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/auth/LoginScreen.tsx.
 *
 * The layout is faithful to mobile: gold-accented "Start your solar journey!"
 * hero above the card, gold divider, email + password, primary CTA with arrow,
 * security note, forgot-password link, signup row, footer line.
 *
 * Deviations:
 *  - Mobile keeps credentials in a `useRef` and calls `loginSchema.safeParse`
 *    by hand; this uses react-hook-form + zodResolver, as mobile's own Signup
 *    screen already does. Same validation, same messages, but the inputs get
 *    labels, `aria-invalid` and native autofill for free.
 *  - The entrance animation (Animated.timing/spring) is a CSS fade-in.
 *  - `navigation.reset` becomes `router.replace` + `router.refresh()`; the
 *    refresh matters because `src/proxy.ts` guards routes on the server and
 *    must re-evaluate now that the session cookie exists.
 */
export const LoginForm = ({
  redirectTo,
  message
}: {
  redirectTo?: string;
  message?: string;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const clearError = useAuthStore((state) => state.clearError);
  const storeError = useAuthStore((state) => state.error);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => () => clearError(), [clearError]);

  const submit = form.handleSubmit(async ({ email, password }) => {
    form.clearErrors('root');
    try {
      await signIn(email.trim(), password);
      router.replace(redirectTo ?? routes.home());
      router.refresh();
    } catch (reason) {
      form.setError('root', {
        message: reason instanceof Error ? reason.message : t('auth.login.invalid')
      });
    }
  });

  const submitting = form.formState.isSubmitting;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="mt-1.5 text-[29px] font-black leading-[35px] text-[#0F172A]">
          <span>Start your </span>
          <span className="text-[#EAB308]">solar journey!</span>
        </h1>
        <p className="mt-1.5 text-[13px] font-semibold leading-[18px] text-[#64748B]">
          Sign in or create your account to continue
        </p>
        <div className="mt-3 mb-4 h-1 w-[42px] rounded-full bg-[#F5B400]" />
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="rounded-[24px] border border-[#EFE3CF] bg-white px-[18px] py-4 shadow-lg"
      >
        <div className="flex flex-col gap-2.5">
          <AuthMessage text={message} tone="success" />
          <AuthMessage text={form.formState.errors.root?.message ?? storeError} />

          <AuthField
            control={form.control}
            name="email"
            label={t('auth.login.email')}
            Icon={Mail}
            type="email"
            autoComplete="email"
            placeholder={t('auth.login.emailPlaceholder')}
          />
          <AuthField
            control={form.control}
            name="password"
            label={t('auth.login.password')}
            Icon={LockKeyhole}
            autoComplete="current-password"
            placeholder={t('auth.login.passwordPlaceholder')}
            secure
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex h-[50px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#F5B400] text-base font-extrabold text-[#0F172A] shadow-md transition-opacity hover:opacity-95 disabled:opacity-65"
        >
          {submitting ? t('auth.login.signingIn') : t('auth.login.signIn')}
          <ArrowRight size={22} strokeWidth={2.6} className="rtl:rotate-180" aria-hidden />
        </button>

        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold leading-[15px] text-[#64748B]">
          <ShieldCheck size={14} strokeWidth={2.2} aria-hidden />
          {t('auth.login.secureNote')}
        </p>

        <div className="mt-4 mb-3 text-center">
          <Link
            href={routes.forgotPassword()}
            className="text-[13px] font-bold text-[#64748B] hover:underline"
          >
            {t('auth.login.forgotPassword')}
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1 border-t border-[#EFE7DA] pt-2.5">
          <span className="text-[13px] font-bold leading-[17px] text-[#0F172A]">
            {t('auth.login.noAccount')}
          </span>
          <Link
            href={routes.signup({ redirectTo })}
            className="text-[13px] font-extrabold leading-[17px] text-[#0F79B2] hover:underline"
          >
            {t('auth.login.signup')}
          </Link>
        </div>
      </form>

      <p className="mt-3 px-3 text-center text-[11px] font-semibold leading-[15px] text-[#64748B]">
        Compare panels, inverters, batteries and book trusted services.
      </p>
    </div>
  );
};
