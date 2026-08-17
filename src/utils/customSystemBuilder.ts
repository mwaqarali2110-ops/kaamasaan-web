import type { Product, ProductCategory } from '@/types/product.types';

export type CustomSystemComponent = 'panel' | 'inverter' | 'battery';

export type CustomSystemBuilderState = {
  active: boolean;
  selectedPanel: Product | null;
  selectedPanelQuantity: number;
  selectedPanelWattage: number;
  selectedInverter: Product | null;
  selectedBattery: Product | null;
  selectedBatteryQuantity: number;
  sourceComponent: CustomSystemComponent | null;
  selectedComponentOrder: CustomSystemComponent[];
};

export const EMPTY_CUSTOM_SYSTEM_BUILDER: CustomSystemBuilderState = {
  active: false,
  selectedPanel: null,
  selectedPanelQuantity: 0,
  selectedPanelWattage: 0,
  selectedInverter: null,
  selectedBattery: null,
  selectedBatteryQuantity: 0,
  sourceComponent: null,
  selectedComponentOrder: []
};

export const toCustomSystemComponent = (
  category: ProductCategory
): CustomSystemComponent | null => category === 'panel' || category === 'inverter' || category === 'battery'
  ? category
  : null;

export const getMissingCustomSystemComponents = (
  builder: CustomSystemBuilderState
): CustomSystemComponent[] => [
  !builder.selectedPanel ? 'panel' as const : null,
  !builder.selectedInverter ? 'inverter' as const : null,
  !builder.selectedBattery ? 'battery' as const : null
].filter((component): component is CustomSystemComponent => Boolean(component));

export const getNextMissingSystemComponent = (
  builder: CustomSystemBuilderState
): CustomSystemComponent | 'system-summary' =>
  getMissingCustomSystemComponents(builder)[0] ?? 'system-summary';

export const isCustomSystemComplete = (builder: CustomSystemBuilderState) =>
  Boolean(builder.selectedPanel && builder.selectedInverter && builder.selectedBattery);

