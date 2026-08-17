/**
 * Web equivalent of React Native's `__DEV__` global (BUILD_PROMPT §8).
 * Ported modules import this instead of relying on the RN global.
 */
export const __DEV__ = process.env.NODE_ENV !== 'production';
