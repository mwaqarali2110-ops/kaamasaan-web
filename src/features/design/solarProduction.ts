/**
 * Islamabad production curves, ported verbatim from the constant block in
 * kaamasaan-mobile/.../DesignSystemFlowScreen.tsx. Multipliers drive the
 * hourly output chart on the solar step.
 */
export const islamabadSolarProductionCurves = {
  summer: {
    subtitle:
      'Estimated June output for your solar system in Islamabad after typical losses.',
    points: [
      { time: '8 AM', multiplier: 0.3 },
      { time: '9 AM', multiplier: 0.5 },
      { time: '10 AM', multiplier: 0.65 },
      { time: '11 AM', multiplier: 0.8 },
      { time: '12 PM', multiplier: 0.9 },
      { time: '1 PM', multiplier: 0.9 },
      { time: '2 PM', multiplier: 0.8 },
      { time: '3 PM', multiplier: 0.66 },
      { time: '4 PM', multiplier: 0.48 },
      { time: '5 PM', multiplier: 0.28 }
    ]
  },
  winter: {
    subtitle:
      'Estimated December output for your solar system in Islamabad after typical losses.',
    points: [
      { time: '8 AM', multiplier: 0.08 },
      { time: '9 AM', multiplier: 0.25 },
      { time: '10 AM', multiplier: 0.45 },
      { time: '11 AM', multiplier: 0.6 },
      { time: '12 PM', multiplier: 0.68 },
      { time: '1 PM', multiplier: 0.64 },
      { time: '2 PM', multiplier: 0.52 },
      { time: '3 PM', multiplier: 0.35 },
      { time: '4 PM', multiplier: 0.15 },
      { time: '5 PM', multiplier: 0.03 }
    ]
  }
} as const;

export type Season = keyof typeof islamabadSolarProductionCurves;
