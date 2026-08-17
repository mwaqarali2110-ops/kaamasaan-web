'use client';

import { useState, type ComponentType, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, Sun } from 'lucide-react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

/**
 * Web port of kaamasaan-mobile/src/mobile/screens/auth/AuthComponents.tsx.
 *
 * The StyleSheet values are carried over as Tailwind classes: 20px card radius,
 * #E8DED2 border, 46px inputs, #8A6A16 icons, 12.5px extrabold labels.
 * Directional padding uses logical properties (ps-/pe-) so Urdu mirrors.
 */

export const AuthShell = ({
  title,
  subtitle,
  children,
  footer
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) => (
  <div className="w-full">
    <div className="mb-6 flex items-center justify-end">
      <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border border-[#F1D99C] bg-[#FFF9E9]">
        <Sun size={20} className="text-[#F5A400]" strokeWidth={2.5} aria-hidden />
      </span>
    </div>
    <h1 className="text-[27px] font-black leading-tight tracking-[-0.7px] text-[#10213A]">{title}</h1>
    <p className="mt-1.5 mb-4 text-[13.5px] font-semibold leading-[19px] text-[#64748B]">{subtitle}</p>
    <div className="flex flex-col gap-3 rounded-[20px] border border-[#E8DED2] bg-white p-4 shadow-sm">
      {children}
    </div>
    {footer}
  </div>
);

type AuthFieldProps<T extends FieldValues> = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name' | 'value' | 'onChange' | 'onBlur'
> & {
  control: Control<T>;
  name: Path<T>;
  label: string;
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  /** Renders a show/hide toggle — replaces RN's `secureTextEntry`. */
  secure?: boolean;
};

export const AuthField = <T extends FieldValues>({
  control,
  name,
  label,
  Icon,
  secure,
  type,
  ...props
}: AuthFieldProps<T>) => {
  const [visible, setVisible] = useState(false);
  const inputId = `field-${String(name)}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={inputId} className="text-[12.5px] font-black text-[#10213A]">
            {label}
          </label>
          <div
            className={cn(
              'flex h-[46px] flex-row items-center gap-2 rounded-[13px] border bg-[#FFFEFB] px-3',
              'focus-within:border-kaam-amber',
              error ? 'border-[#D9534F]' : 'border-[#E5DED3]'
            )}
          >
            <Icon size={17} className="shrink-0 text-[#8A6A16]" strokeWidth={2.1} aria-hidden />
            <input
              {...props}
              id={inputId}
              type={secure && !visible ? 'password' : (type ?? 'text')}
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-[#10213A] outline-none placeholder:text-[#9CA3AF]"
              value={typeof value === 'string' ? value : ''}
              onBlur={onBlur}
              onChange={(event) => onChange(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            {secure ? (
              <button
                type="button"
                onClick={() => setVisible((next) => !next)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] text-[#8B97A8] hover:bg-kaam-surface"
              >
                {visible ? <EyeOff size={18} strokeWidth={2.1} /> : <Eye size={18} strokeWidth={2.1} />}
              </button>
            ) : null}
          </div>
          {error ? (
            <p id={`${inputId}-error`} className="text-[10.5px] font-bold text-[#C2413B]">
              {error.message}
            </p>
          ) : null}
        </div>
      )}
    />
  );
};

export const AuthMessage = ({
  text,
  tone = 'error'
}: {
  text?: string | null;
  tone?: 'error' | 'success';
}) =>
  text ? (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-[11px] p-2.5 text-xs font-bold leading-[17px]',
        tone === 'success' ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#FEF2F2] text-[#B42318]'
      )}
    >
      {text}
    </p>
  ) : null;

export const AuthSubmit = ({
  title,
  loading,
  onClick
}: {
  title: string;
  loading?: boolean;
  onClick?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={loading}
      onClick={onClick}
      className="mt-1 h-12 rounded-[14px] bg-[#F7B500] text-sm font-black text-[#10213A] transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {loading ? t('common.pleaseWait') : title}
    </button>
  );
};

export const AuthLink = ({ title, href }: { title: string; href: string }) => (
  <a href={href} className="text-center text-[12.5px] font-extrabold text-[#9A6C00] hover:underline">
    {title}
  </a>
);
