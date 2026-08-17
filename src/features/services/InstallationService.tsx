'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/components/ui/Screen';
import type { z } from 'zod';
import {
  installationDetailsSchema,
  type InstallationDetailsForm
} from '@/schemas/installation.schema';
import { useSystemStore, type InstallationStructureType } from '@/store/useSystemStore';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/services/InstallationServiceScreen.tsx.
 *
 * The schema marks structureType nullable and then refines it to be non-null,
 * so its input and output types differ. react-hook-form's third generic carries
 * the transformed (output) type, which keeps 'no structure selected yet' as a
 * valid form state while the submit handler still receives a narrowed value.
 *
 * Validation is the ported `installationDetailsSchema` unchanged. On submit the
 * details go to `useSystemStore.setInstallationDetails`, which the Book Survey
 * form reads for the `installation` booking context.
 */
type InstallationFormValues = z.input<typeof installationDetailsSchema>;

const structureOptions: Array<{ value: InstallationStructureType; label: string }> = [
  { value: 'standard', label: 'Standard Structure' },
  { value: 'elevated', label: 'Elevated Structure' },
  { value: 'ground_mounted', label: 'Ground Mounted' },
  { value: 'shed', label: 'Shed Type Structure' }
];

const fields: Array<{
  name: Exclude<keyof InstallationFormValues, 'structureType'>;
  label: string;
  suffix?: string;
  numeric?: boolean;
  placeholder?: string;
}> = [
  { name: 'panelWattage', label: 'Panel wattage', suffix: 'W', numeric: true },
  { name: 'numberOfPanels', label: 'Number of panels', numeric: true },
  { name: 'inverterSize', label: 'Inverter size', suffix: 'kW', numeric: true },
  { name: 'inverterBrand', label: 'Inverter brand', placeholder: 'e.g. FOX' },
  { name: 'batterySize', label: 'Battery size', suffix: 'kWh', numeric: true },
  { name: 'batteryBrand', label: 'Battery brand', placeholder: 'e.g. Pylontech' }
];

export const InstallationService = () => {
  const router = useRouter();
  const setInstallationDetails = useSystemStore((state) => state.setInstallationDetails);

  const form = useForm<InstallationFormValues, unknown, InstallationDetailsForm>({
    resolver: zodResolver(installationDetailsSchema),
    defaultValues: {
      panelWattage: '',
      numberOfPanels: '',
      inverterSize: '',
      inverterBrand: '',
      batterySize: '',
      batteryBrand: '',
      structureType: null
    }
  });

  const submit = form.handleSubmit((values) => {
    setInstallationDetails({
      panelWattage: Number(values.panelWattage),
      numberOfPanels: Number(values.numberOfPanels),
      inverterSizeKw: Number(values.inverterSize),
      inverterBrand: values.inverterBrand.trim(),
      batterySizeKwh: Number(values.batterySize),
      batteryBrand: values.batteryBrand.trim(),
      structureType: values.structureType as InstallationStructureType
    });
    router.push(
      routes.bookSurvey({ source: 'installation_service', bookingContext: 'installation' })
    );
  });

  return (
    <Screen width="narrow">
      <h1 className="text-2xl font-extrabold text-kaam-navy">Solar Panel Installation</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        Tell us what you have and our vetted installers will take it from there.
      </p>

      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5">
        <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <h2 className="text-sm font-extrabold text-kaam-navy">System details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <Controller
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: controlled, fieldState }) => (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12.5px] font-black text-kaam-navy">{field.label}</span>
                    <span
                      className={cn(
                        'flex h-[46px] items-center gap-2 rounded-[13px] border bg-[#FFFEFB] px-3 focus-within:border-kaam-amber',
                        fieldState.error ? 'border-kaam-red' : 'border-kaam-line'
                      )}
                    >
                      <input
                        {...controlled}
                        type={field.numeric ? 'number' : 'text'}
                        inputMode={field.numeric ? 'decimal' : undefined}
                        placeholder={field.placeholder}
                        aria-invalid={Boolean(fieldState.error)}
                        className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#9CA3AF]"
                      />
                      {field.suffix ? (
                        <span className="shrink-0 text-xs font-bold text-kaam-muted">
                          {field.suffix}
                        </span>
                      ) : null}
                    </span>
                    {fieldState.error ? (
                      <span className="text-[10.5px] font-bold text-kaam-red" role="alert">
                        {fieldState.error.message}
                      </span>
                    ) : null}
                  </label>
                )}
              />
            ))}
          </div>
        </section>

        <Controller
          control={form.control}
          name="structureType"
          render={({ field, fieldState }) => (
            <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
              <h2 className="text-sm font-extrabold text-kaam-navy">Structure type</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {structureOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    aria-pressed={field.value === option.value}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-start text-sm font-extrabold transition-colors',
                      field.value === option.value
                        ? 'border-kaam-amber bg-kaam-yellow/10 text-kaam-navy'
                        : 'border-kaam-line text-kaam-muted hover:border-kaam-amber'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {fieldState.error ? (
                <p className="mt-2 text-[10.5px] font-bold text-kaam-red" role="alert">
                  {fieldState.error.message}
                </p>
              ) : null}
            </section>
          )}
        />

        <button
          type="submit"
          className="h-12 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber sm:self-start sm:px-8"
        >
          Continue to Booking
        </button>
      </form>
    </Screen>
  );
};
