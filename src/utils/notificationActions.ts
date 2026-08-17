import type { CustomerNotification } from '@/services/notifications.api';
import { openSupportWhatsApp } from '@/services/notifications.api';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/utils/notificationActions.ts.
 *
 * Mobile calls `navigation.navigate(screenName, params)` with React Navigation
 * screen names; here each branch calls `router.push(routes.x(...))` instead.
 * The decision tree and its fallback order are otherwise identical, including
 * `open_screen` — mobile treats `actionValue` as a screen name to navigate to
 * directly, which has no literal web equivalent; the same admin-configured
 * value is looked up against the route table below instead of executed as a
 * raw path, so a malformed or unrecognized value degrades to a no-op rather
 * than an arbitrary client-side navigation.
 */
type ActionNotification = Pick<
  CustomerNotification,
  'type' | 'actionType' | 'actionValue' | 'surveyBookingId'
>;

/** Structural subset of Next's `useRouter()` return value — avoids importing
 * a router-instance type that isn't exported from 'next/navigation'. */
type Router = { push: (href: string) => void };

/** Screen names mobile's `open_screen` action value may carry, mapped to routes. */
const openScreenTargets: Record<string, () => string> = {
  Home: () => routes.home(),
  Marketplace: () => routes.marketplace(),
  MySystem: () => routes.mySystem(),
  MyProject: () => routes.myProject(),
  Profile: () => routes.profile(),
  Notifications: () => routes.notifications(),
  BookSurvey: () => routes.bookSurvey(),
  HelpCenter: () => routes.helpCenter(),
  HowItWorks: () => routes.howItWorks(),
  SolarCareMembership: () => routes.solarCareMembership()
};

export const performNotificationAction = async (
  notification: ActionNotification,
  router: Router
) => {
  const actionType = notification.actionType;

  if (actionType === 'open_project_progress') {
    const bookingId = notification.actionValue || notification.surveyBookingId;
    if (bookingId) router.push(routes.solarJourney(bookingId));
    return;
  }

  if (actionType === 'open_notifications') {
    router.push(routes.notifications());
    return;
  }

  if (actionType === 'open_maintenance_progress' && notification.actionValue) {
    router.push(routes.premiumCareProgress({ planId: notification.actionValue }));
    return;
  }

  if (actionType === 'open_maintenance_feedback' && notification.actionValue) {
    router.push(routes.premiumCareProgress({ visitId: notification.actionValue }));
    return;
  }

  if (actionType === 'open_screen' && notification.actionValue) {
    const target = openScreenTargets[notification.actionValue];
    if (target) router.push(target());
    return;
  }

  if (actionType === 'whatsapp' || actionType === 'open_whatsapp') {
    await openSupportWhatsApp(notification.actionValue ?? undefined);
    return;
  }

  if (notification.type === 'survey_cancelled') {
    router.push(routes.bookSurvey());
    return;
  }

  if (notification.surveyBookingId) {
    router.push(routes.solarJourney(notification.surveyBookingId));
  }
};
