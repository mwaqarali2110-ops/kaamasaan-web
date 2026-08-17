import { z } from 'zod';
import { t as defaultTranslate, type Translate } from '@/i18n';

/**
 * Ported from kaamasaan-mobile/src/schemas/auth.schema.ts.
 *
 * Deviation: mobile builds these schemas at module scope, so `i18n.t()` runs
 * once at import. That freezes every validation message in whichever language
 * was active at first import — switching to Urdu leaves form errors in English
 * until the app restarts. It also yields raw keys if the module is imported
 * before i18n has initialised, which SSR makes likely.
 *
 * These are factories instead, so messages resolve in the current language at
 * render time. Consumers pass the `t` from `useTranslation()`:
 *
 *   const { t } = useTranslation();
 *   useForm({ resolver: zodResolver(loginSchema(t)) });
 *
 * `t` defaults to the singleton so non-React callers still work.
 */

export const loginSchema = (t: Translate = defaultTranslate) =>
  z.object({
    email: z.string().email({ message: t('auth.errors.validEmail') }),
    password: z.string().min(6, { message: t('auth.errors.passwordMin') })
  });

export const signupSchema = (t: Translate = defaultTranslate) =>
  z
    .object({
      full_name: z.string().min(2, { message: t('auth.errors.fullName') }),
      phone: z.string().min(10, { message: t('auth.errors.phone') }),
      city: z.string().min(2, { message: t('auth.errors.city') }),
      email: z.string().email({ message: t('auth.errors.validEmail') }),
      password: z.string().min(6, { message: t('auth.errors.passwordMin') }),
      confirm_password: z.string().min(6, { message: t('auth.errors.confirmPassword') })
    })
    .refine((values) => values.password === values.confirm_password, {
      message: t('auth.errors.passwordsMatch'),
      path: ['confirm_password']
    });

export const forgotPasswordSchema = (t: Translate = defaultTranslate) =>
  z.object({
    email: z.string().email({ message: t('auth.errors.validEmail') })
  });

export type LoginForm = z.infer<ReturnType<typeof loginSchema>>;
export type SignupForm = z.infer<ReturnType<typeof signupSchema>>;
export type ForgotPasswordForm = z.infer<ReturnType<typeof forgotPasswordSchema>>;
