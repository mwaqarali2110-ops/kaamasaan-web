import type { Product } from './product.types';
import type { RecommendedPackage } from '@/utils/packageBuilder';
import type { BatteryConfiguration } from '@/utils/batteryRecommendation';
import type { CustomSystemBuilderState } from '@/utils/customSystemBuilder';

export type Appliance = {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  hours: number;
};

export type SystemSummary = {
  solarKw: number;
  panelWattage: number;
  selectedPanelBrand?: string | null;
  panelCount: number;
  roofAreaSqFt: number;
  inverter?: Product | null;
  battery?: Product | null;
  panels?: Product | null;
  accessories: Product[];
  packageName?: string;
  selectedRecommendedPackageId?: string | null;
  selectedRecommendedPackage?: RecommendedPackage | null;
  selectedBatteryConfiguration?: BatteryConfiguration | null;
  customSystemBuilder?: CustomSystemBuilderState;
};

export type BackupDecision = 'yes' | 'no' | null;
