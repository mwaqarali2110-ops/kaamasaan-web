'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Building2, LockKeyhole, Mail, Phone, User } from 'lucide-react';
import { AuthField, AuthMessage, AuthShell, AuthSubmit } from '@/components/auth/AuthComponents';
import { signupSchema, type SignupForm as SignupFormValues } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/useAuthStore';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/auth/SignupScreen.tsx.
 * Same six fields, same order, same validation, same post-signup branching.
 */
export const SignupForm = ({ redirectTo }: { redirectTo?: string }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const clearError = useAuthStore((state) => state.clearError);
  const storeError = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema(t)),
    defaultValues: {
      full_name: '',
      phone: '',
      city: '',
      email: '',
      password: '',
      confirm_password: ''
    }
  });

  useEffect(() => () => clearError(), [clearError]);

  const submit = form.handleSubmit(async ({ confirm_password: _confirm, ...values }) => {
    form.clearErrors('root');
    try {
      const result = await signUp(values);
      if (result.needsEmailConfirmation) {
        // Mobile resets to Login with a success message; same idea via query.
        router.replace(routes.login({ redirectTo, message: t('auth.signup.createdCheckEmail') }));
      } else {
        router.replace(redirectTo ?? routes.home());
      }
      router.refresh();
    } catch (reason) {
      form.setError('root', {
        message: reason instanceof Error ? reason.message : t('auth.signup.unable')
      });
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <AuthShell
        title={t('auth.signup.title')}
        subtitle={t('auth.signup.subtitle')}
        footer={
          <div className="mt-4 text-center">
            <Link
              href={routes.login({ redirectTo })}
              className="text-[12.5px] font-extrabold text-[#9A6C00] hover:underline"
            >
              {t('auth.signup.alreadyHaveAccount')}
            </Link>
          </div>
        }
      >
        <AuthMessage text={form.formState.errors.root?.message ?? storeError} />
        <AuthField
          control={form.control}
          name="full_name"
          label={t('auth.signup.fullName')}
          Icon={User}
          autoComplete="name"
          placeholder={t('auth.signup.fullNamePlaceholder')}
        />
        <AuthField
          control={form.control}
          name="phone"
          label={t('auth.signup.phone')}
          Icon={Phone}
          type="tel"
          autoComplete="tel"
          placeholder={t('auth.signup.phonePlaceholder')}
        />
        <AuthField
          control={form.control}
          name="city"
          label={t('auth.signup.city')}
          Icon={Building2}
          autoComplete="address-level2"
          placeholder={t('auth.signup.cityPlaceholder')}
        />
        <AuthField
          control={form.control}
          name="email"
          label={t('auth.signup.email')}
          Icon={Mail}
          type="email"
          autoComplete="email"
          placeholder={t('auth.signup.emailPlaceholder')}
        />
        <AuthField
          control={form.control}
          name="password"
          label={t('auth.signup.password')}
          Icon={LockKeyhole}
          autoComplete="new-password"
          placeholder={t('auth.signup.passwordPlaceholder')}
          secure
        />
        <AuthField
          control={form.control}
          name="confirm_password"
          label={t('auth.signup.confirmPassword')}
          Icon={LockKeyhole}
          autoComplete="new-password"
          placeholder={t('auth.signup.confirmPasswordPlaceholder')}
          secure
        />
        <AuthSubmit
          title={t('auth.signup.createAccount')}
          loading={loading || form.formState.isSubmitting}
        />
      </AuthShell>
    </form>
  );
};
