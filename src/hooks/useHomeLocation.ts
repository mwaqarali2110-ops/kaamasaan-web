'use client';

import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@/lib/localStore';
import { useAuthStore } from '@/store/useAuthStore';

const HOME_LOCATION_STORAGE_KEY = 'kaamasaan.home.location';
const FALLBACK_LOCATION = 'Islamabad, Pakistan';

const formatCityLocation = (city?: string | null) => {
  const normalizedCity = city?.trim();
  if (!normalizedCity) return null;
  return normalizedCity.toLowerCase().includes('pakistan') ? normalizedCity : `${normalizedCity}, Pakistan`;
};

export const useHomeLocation = () => {
  const profileCity = useAuthStore((state) => state.profile?.city);
  const [cachedLocation, setCachedLocation] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(HOME_LOCATION_STORAGE_KEY).then((storedLocation) => {
      if (mounted && storedLocation) setCachedLocation(storedLocation);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const profileLocation = formatCityLocation(profileCity);

  useEffect(() => {
    if (!profileLocation) return;
    // Mobile also calls setCachedLocation(profileLocation) here. That is dead
    // work: the returned label is `profileLocation || cachedLocation || ...`,
    // so profileLocation already wins whenever it is set. The extra setState
    // only triggers a cascading re-render (react-hooks/set-state-in-effect).
    // Persisting for the next visit is the effect's real job.
    void AsyncStorage.setItem(HOME_LOCATION_STORAGE_KEY, profileLocation);
  }, [profileLocation]);

  return useMemo(
    () => ({
      locationLabel: profileLocation || cachedLocation || FALLBACK_LOCATION,
      source: profileLocation ? 'profile' : cachedLocation ? 'cached' : 'fallback'
    }),
    [cachedLocation, profileLocation]
  );
};
