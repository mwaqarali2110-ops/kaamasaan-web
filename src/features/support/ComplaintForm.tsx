'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, FileText, Hash, ImageIcon, Phone, Send, ShieldCheck, X } from 'lucide-react';
import { complaintsApi } from '@/services/browser';
import type { ComplaintType } from '@/services/complaints.api';
import { useAuthStore } from '@/store/useAuthStore';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/support/ComplaintScreen.tsx.
 *
 * Validation rules (complaint type, subject, details, contact number all
 * required) are copied exactly. Photo attachment is the deviation: mobile uses
 * `expo-image-picker` to get a file `uri`, which
 * `uploadComplaintAttachment` then `fetch()`s into a blob before uploading to
 * Supabase Storage. On web an `<input type="file">` gives a `File` directly;
 * wrapping it with `URL.createObjectURL` produces a `blob:` URL that the same
 * `fetch()` call can read identically, so the ported service function needed
 * no changes — only the object URL must be revoked after use to avoid leaking
 * memory, which mobile's native URI has no equivalent concern for.
 */
const complaintTypes: Array<{ label: string; value: ComplaintType }> = [
  { label: 'System Issue', value: 'system_issue' },
  { label: 'Preventive Maintenance Feedback', value: 'preventive_maintenance_feedback' },
  { label: 'Installation Complaint', value: 'installation_complaint' },
  { label: 'Electrical Work Complaint', value: 'electrical_work_complaint' },
  { label: 'Cleaning Complaint', value: 'cleaning_complaint' },
  { label: 'Net Billing Complaint', value: 'net_billing_complaint' },
  { label: 'Other', value: 'other' }
];

type FormErrors = {
  complaintType?: string;
  subject?: string;
  details?: string;
  contactNumber?: string;
};

export const ComplaintForm = () => {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);

  const [complaintType, setComplaintType] = useState<ComplaintType | ''>('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [contactNumber, setContactNumber] = useState(profile?.phone ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintReference, setComplaintReference] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreviewUrl, setAttachedPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!complaintType) nextErrors.complaintType = 'Please select complaint type.';
    if (!subject.trim()) nextErrors.subject = 'Please enter complaint subject.';
    if (!details.trim()) nextErrors.details = 'Please describe your complaint.';
    if (!contactNumber.trim()) nextErrors.contactNumber = 'Please enter contact number.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFilePicked = (file: File | undefined) => {
    if (!file) return;
    if (attachedPreviewUrl) URL.revokeObjectURL(attachedPreviewUrl);
    setAttachedFile(file);
    setAttachedPreviewUrl(URL.createObjectURL(file));
  };

  const removeAttachment = () => {
    if (attachedPreviewUrl) URL.revokeObjectURL(attachedPreviewUrl);
    setAttachedFile(null);
    setAttachedPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const imageUrl =
        attachedFile && attachedPreviewUrl
          ? await complaintsApi.uploadComplaintAttachment({
              uri: attachedPreviewUrl,
              mimeType: attachedFile.type,
              userId: session?.user.id ?? null
            })
          : null;
      const result = await complaintsApi.submitComplaint({
        user_id: session?.user.id ?? null,
        complaint_type: complaintType as ComplaintType,
        subject,
        details,
        reference_number: referenceNumber,
        contact_number: contactNumber,
        image_url: imageUrl
      });
      setComplaintReference(result.reference);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToHome = () => {
    setComplaintReference('');
    router.push(routes.home());
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-8 md:px-6">
      <div className="flex items-start gap-3 py-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-kaam-yellow/20">
          <ShieldCheck size={22} className="text-[#D99A00]" strokeWidth={2.4} aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-kaam-navy">Complaint</h1>
          <p className="mt-1 text-sm text-kaam-muted">
            Tell us what went wrong. Our support team will review and contact you.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <div>
          <label className="text-[12.5px] font-black text-kaam-navy">Complaint Type</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {complaintTypes.map((item) => {
              const selected = item.value === complaintType;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setComplaintType(item.value);
                    setErrors((current) => ({ ...current, complaintType: undefined }));
                  }}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-full border px-3.5 py-2 text-xs font-extrabold transition-colors',
                    selected
                      ? 'border-kaam-amber bg-kaam-yellow/15 text-kaam-navy'
                      : 'border-kaam-line text-kaam-muted hover:border-kaam-amber'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          {errors.complaintType ? (
            <p className="mt-1.5 text-[10.5px] font-bold text-kaam-red" role="alert">
              {errors.complaintType}
            </p>
          ) : null}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-black text-kaam-navy">Subject</span>
          <span
            className={cn(
              'flex h-[46px] items-center gap-2 rounded-[13px] border bg-[#FFFEFB] px-3 focus-within:border-kaam-amber',
              errors.subject ? 'border-kaam-red' : 'border-kaam-line'
            )}
          >
            <FileText size={19} className="shrink-0 text-[#D99A00]" strokeWidth={2.2} aria-hidden />
            <input
              type="text"
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setErrors((current) => ({ ...current, subject: undefined }));
              }}
              placeholder="Enter complaint subject"
              aria-invalid={Boolean(errors.subject)}
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#94A3B8]"
            />
          </span>
          {errors.subject ? (
            <span className="text-[10.5px] font-bold text-kaam-red" role="alert">
              {errors.subject}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-black text-kaam-navy">Complaint Details</span>
          <textarea
            rows={4}
            value={details}
            onChange={(event) => {
              setDetails(event.target.value);
              setErrors((current) => ({ ...current, details: undefined }));
            }}
            placeholder="Describe your issue in detail"
            aria-invalid={Boolean(errors.details)}
            className={cn(
              'resize-none rounded-[13px] border bg-[#FFFEFB] p-3 text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#94A3B8] focus:border-kaam-amber',
              errors.details ? 'border-kaam-red' : 'border-kaam-line'
            )}
          />
          {errors.details ? (
            <span className="text-[10.5px] font-bold text-kaam-red" role="alert">
              {errors.details}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-black text-kaam-navy">
            Reference Number / Project ID <span className="font-semibold text-kaam-muted">(optional)</span>
          </span>
          <span className="flex h-[46px] items-center gap-2 rounded-[13px] border border-kaam-line bg-[#FFFEFB] px-3 focus-within:border-kaam-amber">
            <Hash size={19} className="shrink-0 text-[#D99A00]" strokeWidth={2.2} aria-hidden />
            <input
              type="text"
              value={referenceNumber}
              onChange={(event) => setReferenceNumber(event.target.value)}
              placeholder="Enter booking or project reference if available"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#94A3B8]"
            />
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-black text-kaam-navy">Contact Number</span>
          <span
            className={cn(
              'flex h-[46px] items-center gap-2 rounded-[13px] border bg-[#FFFEFB] px-3 focus-within:border-kaam-amber',
              errors.contactNumber ? 'border-kaam-red' : 'border-kaam-line'
            )}
          >
            <Phone size={19} className="shrink-0 text-[#D99A00]" strokeWidth={2.2} aria-hidden />
            <input
              type="tel"
              value={contactNumber}
              onChange={(event) => {
                setContactNumber(event.target.value);
                setErrors((current) => ({ ...current, contactNumber: undefined }));
              }}
              placeholder="Enter contact number"
              aria-invalid={Boolean(errors.contactNumber)}
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#94A3B8]"
            />
          </span>
          {errors.contactNumber ? (
            <span className="text-[10.5px] font-bold text-kaam-red" role="alert">
              {errors.contactNumber}
            </span>
          ) : null}
        </label>

        <div>
          <label htmlFor="complaint-photo-input" className="text-[12.5px] font-black text-kaam-navy">
            Attach Photo <span className="font-semibold text-kaam-muted">(optional)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(event) => handleFilePicked(event.target.files?.[0])}
            className="hidden"
            id="complaint-photo-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-kaam-line bg-white p-3.5 text-start transition-colors hover:border-kaam-amber"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kaam-yellow/20">
              <ImageIcon size={19} className="text-[#D99A00]" strokeWidth={2.2} aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-kaam-navy">
                {attachedFile ? 'Change attached photo' : 'Attach photo'}
              </span>
              <span className="block text-xs text-kaam-muted">Choose an image from your device.</span>
            </span>
          </button>

          {attachedFile && attachedPreviewUrl ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-kaam-line bg-white p-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-kaam-surface">
                <Image src={attachedPreviewUrl} alt="" fill sizes="56px" className="object-cover" unoptimized />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-kaam-navy">
                  {attachedFile.name || 'Complaint photo attached'}
                </span>
                <span className="block text-xs text-kaam-muted">
                  This image will be included with your complaint.
                </span>
              </span>
              <button
                type="button"
                onClick={removeAttachment}
                aria-label="Remove attached photo"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-kaam-navy hover:bg-kaam-surface"
              >
                <X size={16} strokeWidth={2.5} aria-hidden />
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-60"
        >
          <Send size={18} strokeWidth={2.4} aria-hidden />
          {isSubmitting ? 'Submitting…' : 'Submit Complaint'}
        </button>
      </form>

      {complaintReference ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kaam-navy/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-kaam-cream p-6 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-kaam-yellow/20">
              <CheckCircle2 size={42} className="text-kaam-navy" strokeWidth={2.3} aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-extrabold text-kaam-navy">Complaint Submitted</h2>
            <p className="mt-2 text-sm text-kaam-muted">
              Your complaint has been received. Our support team will review it and contact you
              shortly.
            </p>
            <div className="mt-4 rounded-xl bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-kaam-muted">
                Complaint ID
              </p>
              <p className="mt-0.5 text-base font-extrabold text-kaam-navy">{complaintReference}</p>
            </div>
            <button
              type="button"
              onClick={backToHome}
              className="mt-5 h-11 w-full rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
