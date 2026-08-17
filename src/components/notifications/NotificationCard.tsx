'use client';

import Image from 'next/image';
import { CalendarClock, ClipboardCheck, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Web port of kaamasaan-mobile/src/components/notifications/NotificationCard.tsx.
 * The action-resolution and date-label rules are unchanged.
 */
export type NotificationItem = {
  id: string;
  notification_key?: string | null;
  survey_booking_id?: string | null;
  type: string;
  title: string;
  message: string;
  action_type?: string | null;
  action_value?: string | null;
  is_read: boolean;
  created_at: string;
};

const getNotificationAction = (notification: NotificationItem) => {
  if (notification.type === 'survey_cancelled') {
    return { label: 'Book a New Survey', Icon: ClipboardCheck, variant: 'cancelled' as const };
  }
  if (notification.action_type === 'open_project_progress') {
    return { label: 'View Project Progress', Icon: ClipboardCheck, variant: 'project' as const };
  }
  if (notification.type === 'survey_welcome' || notification.action_type === 'whatsapp') {
    return { label: 'Contact Our Representative', Icon: MessageCircle, variant: 'whatsapp' as const };
  }
  return null;
};

const getDateLabel = (notification: NotificationItem) => {
  const formattedDate = new Date(notification.created_at).toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  if (notification.type === 'survey_cancelled') return `Survey cancelled: ${formattedDate}`;
  if (notification.type === 'survey_welcome') return `Survey booked: ${formattedDate}`;
  return formattedDate;
};

export const NotificationCard = ({
  notification,
  onActionPress
}: {
  notification: NotificationItem;
  onActionPress: (notification: NotificationItem) => void;
}) => {
  const action = getNotificationAction(notification);
  const isWhatsappAction = action?.variant === 'whatsapp';

  return (
    <article
      className={cn(
        'w-full rounded-2xl border bg-white p-3.5 shadow-sm',
        !notification.is_read ? 'border-[#EAC859]' : 'border-[#E8D9B6]'
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl border border-[#E7C548] bg-[#FFF5CF]">
          <Image
            src="/assets/onboarding/Splash-Screen-Cart-1-transparent.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-extrabold leading-[22px] text-[#10233F]">
            {notification.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#806B41]">
            <CalendarClock size={16} strokeWidth={2} aria-hidden />
            {getDateLabel(notification)}
          </p>
        </div>

        {!notification.is_read ? (
          <span
            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#F7B801]"
            aria-label="Unread"
          />
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-5 text-[#48576A]">{notification.message}</p>

      {action ? (
        <button
          type="button"
          onClick={() => onActionPress(notification)}
          className={cn(
            'mt-3.5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-[14.5px] font-extrabold transition-opacity hover:opacity-90',
            isWhatsappAction ? 'bg-[#25D366] text-white' : 'bg-[#F7B801] text-[#10233F]'
          )}
        >
          <action.Icon size={20} strokeWidth={2.3} aria-hidden />
          {action.label}
        </button>
      ) : null}
    </article>
  );
};
