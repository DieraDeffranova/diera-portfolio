/**
 * Structure of the Services, Tools and project-request options.
 * The visible text for each language lives in src/i18n/locales/*.ts under the same keys.
 */
export type ServiceId = 'motion' | 'design3d' | 'product' | 'graphic';
export type NeedId = 'motion' | 'animation3d' | 'product' | 'social' | 'logo' | 'graphic' | 'other';
export type DeadlineId = 'flexible' | 'd1_3' | 'd4_7' | 'w1_2' | 'm1';
export type BudgetId = 'b50' | 'b100' | 'b250' | 'b500' | 'discuss';
export type ToolId = 'afterEffects' | 'cinema4d' | 'blender' | 'canva';

export interface Service {
  id: ServiceId;
  number: string;
  /** Option preselected in the project request form when this service is clicked. */
  need: NeedId;
}

export const services: Service[] = [
  { id: 'motion', number: '01', need: 'motion' },
  { id: 'design3d', number: '02', need: 'animation3d' },
  { id: 'product', number: '03', need: 'product' },
  { id: 'graphic', number: '04', need: 'graphic' },
];

/** Tool names are brand names and are never translated. */
export const tools: Array<{ id: ToolId; name: string }> = [
  { id: 'afterEffects', name: 'After Effects' },
  { id: 'cinema4d', name: 'Cinema 4D' },
  { id: 'blender', name: 'Blender' },
  { id: 'canva', name: 'Canva' },
];

export const needIds: NeedId[] = ['motion', 'animation3d', 'product', 'social', 'logo', 'graphic', 'other'];
export const deadlineIds: DeadlineId[] = ['flexible', 'd1_3', 'd4_7', 'w1_2', 'm1'];
export const budgetIds: BudgetId[] = ['b50', 'b100', 'b250', 'b500', 'discuss'];
