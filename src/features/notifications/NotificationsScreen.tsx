'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotificationCard, type NotificationItem } from '@/components/notifications/NotificationCard';
import {
  useMarkNotificationRead,
  useNotificationRealtime,
  useNotifications
} from '@/hooks/useNotifications';
import type { CustomerNotification } from '@/services/notifications.api';
import { useAuthStore } from '@/store/useAuthStore';
import { performNotificationAction } from '@/utils/notificationActions';
import { Screen } from '@/components/ui/Screen';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/notifications/NotificationsScreen.tsx.
 *
 * Deduplication by `notification_key`, the survey-welcome message override, and
 * the sort-by-recency rule are copied unchanged from `getUniqueNotificationItems`.
 * `useNotificationRealtime` (already ported in Phase 3) is wired in here — the
 * first live Supabase subscription actually driving UI in the web app.
 */
const toNotificationItem = (notification: CustomerNotification): NotificationItem => ({
  id: notification.id,
  notification_key: notification.notificationKey,
  survey_booking_id: notification.surveyBookingId,
  type: notification.type,
  title: notification.title,
  message:
    notification.type === 'survey_welcome'
      ? 'Thank you for choosing KaamAsaan for your solar system installation. We look forward to providing you with an excellent service experience. For any questions or assistance, please contact our representative.'
      : notification.message,
  action_type: notification.actionType,
  action_value: notification.actionValue,
  is_read: notification.isRead,
  created_at: notification.surveyBookingCreatedAt ?? notification.createdAt
});

const getUniqueNotificationItems = (notifications: CustomerNotification[]) => {
  const items = notifications.map(toNotificationItem);
  return Array.from(
    new Map(items.map((notification) => [notification.notification_key || notification.id, notification])).values()
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const NotificationsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useAuthStore((state) => state.session?.user.id);
  const notifications = useNotifications(userId);
  const markRead = useMarkNotificationRead(userId);
  useNotificationRealtime(userId);

  const notificationItems = useMemo(
    () => getUniqueNotificationItems(notifications.data ?? []),
    [notifications.data]
  );

  const handleActionPress = async (notification: NotificationItem) => {
    if (!notification.is_read) await markRead.mutateAsync(notification.id);
    await performNotificationAction(
      {
        type: notification.type,
        actionType: notification.action_type ?? null,
        actionValue: notification.action_value ?? null,
        surveyBookingId: notification.survey_booking_id ?? null
      },
      router
    );
  };

  return (
    <Screen width="narrow">
      <h1 className="text-2xl font-extrabold text-kaam-navy">{t('notifications.title')}</h1>

      {notifications.isLoading ? (
        <div className="mt-8 h-64 animate-pulse rounded-xl2 border border-kaam-line bg-kaam-card" />
      ) : notifications.isError ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl2 border border-kaam-line bg-kaam-card p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-kaam-yellow/20">
            <Bell size={28} className="text-[#B07800]" strokeWidth={2.3} aria-hidden />
          </span>
          <p className="text-base font-extrabold text-kaam-navy">Unable to load notifications</p>
          <p className="text-sm text-kaam-muted">Please check your connection and try again.</p>
          <button
            type="button"
            onClick={() => void notifications.refetch()}
            className="flex items-center gap-2 rounded-2xl border border-kaam-line bg-white px-4 py-2 text-sm font-extrabold text-kaam-navy hover:border-kaam-amber"
          >
            <RefreshCw size={16} strokeWidth={2.5} aria-hidden />
            Retry
          </button>
        </div>
      ) : notificationItems.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl2 border border-kaam-line bg-kaam-card p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-kaam-yellow/20">
            <Bell size={28} className="text-[#B07800]" strokeWidth={2.3} aria-hidden />
          </span>
          <p className="text-base font-extrabold text-kaam-navy">{t('notifications.emptyTitle')}</p>
          <p className="text-sm text-kaam-muted">{t('notifications.emptyText')}</p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {notificationItems.map((item) => (
            <li key={item.notification_key || item.id}>
              <NotificationCard
                notification={item}
                onActionPress={(notification) => void handleActionPress(notification)}
              />
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
};
