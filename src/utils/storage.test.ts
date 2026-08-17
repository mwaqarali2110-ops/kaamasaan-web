import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { supabaseUrl } from '@/lib/env';
import { normalizePublicStorageUrl } from './storage';

/**
 * Parity test for the one deviation in the ported storage util.
 *
 * Mobile calls `supabase.storage.from(bucket).getPublicUrl(path)`; the web port
 * composes the URL from the project URL instead, so it works identically on the
 * server (SSG marketplace pages) and in the browser. This asserts the two
 * produce the same string, using the real SDK as the oracle — if Supabase ever
 * changes its public URL format, this fails instead of silently breaking every
 * product image.
 */
const sdkPublicUrl = (bucket: string, path: string) =>
  createClient(supabaseUrl, 'test-anon-key').storage.from(bucket).getPublicUrl(path).data.publicUrl;

describe('normalizePublicStorageUrl', () => {
  it('matches the Supabase SDK for a plain path', () => {
    expect(normalizePublicStorageUrl('brand-logos', 'fox.png')).toBe(
      sdkPublicUrl('brand-logos', 'fox.png')
    );
  });

  it('matches the SDK for a nested path', () => {
    expect(normalizePublicStorageUrl('products', 'inverters/fox/ep12.webp')).toBe(
      sdkPublicUrl('products', 'inverters/fox/ep12.webp')
    );
  });

  it('passes absolute URLs through untouched', () => {
    const absolute = 'https://cdn.example.com/a.png?v=1';
    expect(normalizePublicStorageUrl('products', absolute)).toBe(absolute);
  });

  it('returns undefined for empty input', () => {
    expect(normalizePublicStorageUrl('products', '')).toBeUndefined();
    expect(normalizePublicStorageUrl('products', '   ')).toBeUndefined();
    expect(normalizePublicStorageUrl('products', null)).toBeUndefined();
  });

  it('strips a leading slash, a storage prefix and a duplicated bucket segment', () => {
    const expected = sdkPublicUrl('products', 'a.png');
    expect(normalizePublicStorageUrl('products', '/a.png')).toBe(expected);
    expect(normalizePublicStorageUrl('products', 'storage/v1/object/public/a.png')).toBe(expected);
    expect(normalizePublicStorageUrl('products', 'products/a.png')).toBe(expected);
  });
});
