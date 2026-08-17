'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { AuthField, AuthMessage, AuthShell, AuthSubmit } from '@/components/auth/AuthComponents';
import {
  forgotPasswordSchema,
  type ForgotPasswordForm as ForgotPasswordValues
} from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/useAuthStore';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/auth/ForgotPasswordScreen.tsx.
 * Adds the "Back to Login" link, which mobile provided via the header back
 * button (`auth.forgot.back` already exists in the locale files but was unused).
 */
export const ForgotPasswordForm = () => {
  const { t } = useTranslation();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const clearError = useAuthStore((state) => state.clearError);
  const loading = useAuthStore((state) => state.loading);
  const [message, setMessage] = useState('');

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema(t)),
    defaultValues: { email: '' }
  });

  useEffect(() => () => clearError(), [clearError]);

  const submit = form.handleSubmit(async ({ email }) => {
    form.clearErrors('root');
    setMessage('');
    try {
      await requestPasswordReset(email);
      setMessage(t('auth.forgot.sent'));
    } catch (reason) {
      form.setError('root', {
        message: reason instanceof Error ? reason.message : t('auth.forgot.unable')
      });
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <AuthShell
        title={t('auth.forgot.title')}
        subtitle={t('auth.forgot.subtitle')}
        footer={
          <div className="mt-4 text-center">
            <Link
              href={routes.login()}
              className="text-[12.5px] font-extrabold text-[#9A6C00] hover:underline"
            >
              {t('auth.forgot.back')}
            </Link>
          </div>
        }
      >
        <AuthMessage text={message} tone="success" />
        <AuthMessage text={form.formState.errors.root?.message} />
        <AuthField
          control={form.control}
          name="email"
          label={t('auth.signup.email')}
          Icon={Mail}
          type="email"
          autoComplete="email"
          placeholder={t('auth.signup.emailPlaceholder')}
        />
        <AuthSubmit title={t('auth.forgot.send')} loading={loading || form.formState.isSubmitting} />
      </AuthShell>
    </form>
  );
};
