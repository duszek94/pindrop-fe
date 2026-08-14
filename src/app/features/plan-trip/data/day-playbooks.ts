import type { DayBlockKind } from '../../../core/models/plan-trip.models';

export interface DayPlaybook {
  kind: DayBlockKind;
  expectedPins: string[];
}

export const DAY_PLAYBOOKS: Record<DayBlockKind, DayPlaybook> = {
  TREK: { kind: 'TREK', expectedPins: ['PARKING', 'TRAILHEAD', 'VIEWPOINT', 'HUT'] },
  CITY_WALK: { kind: 'CITY_WALK', expectedPins: ['STOP', 'VIEWPOINT'] },
  MUSEUM: { kind: 'MUSEUM', expectedPins: ['MUSEUM', 'RESTAURANT'] },
  BEACH: { kind: 'BEACH', expectedPins: ['BEACH', 'RESTAURANT'] },
  CAMP: { kind: 'CAMP', expectedPins: ['CAMP', 'SHOP', 'TRAILHEAD'] },
  FOOD: { kind: 'FOOD', expectedPins: ['RESTAURANT'] },
  TRANSIT: { kind: 'TRANSIT', expectedPins: ['STOP'] },
  EVENING: { kind: 'EVENING', expectedPins: ['RESTAURANT', 'VIEWPOINT'] },
  REST: { kind: 'REST', expectedPins: [] },
  ARRIVAL: { kind: 'ARRIVAL', expectedPins: ['LODGING'] },
};
