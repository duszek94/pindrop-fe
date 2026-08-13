import type { ItineraryActivity, TripItinerary } from '../../../core/models/plan-trip.models';
import { activityToBlock, inferBlockKind, toDayPlan } from './day-plan.mapper';

const baseActivity: ItineraryActivity = {
  id: 1,
  startTime: '08:30:00',
  endTime: '17:00:00',
  type: 'ACTIVITY',
  title: 'Szlak na Rysy',
  description: 'Główna część trekkingu.',
  placeName: 'Wodogrzmoty Mickiewicza',
  lat: 49.213,
  lng: 20.071,
  tempC: 18,
  routeWaypoints: [
    { name: 'Wodogrzmoty Mickiewicza', lat: 49.213, lng: 20.071 },
    { name: 'Czarny Staw', lat: 49.188, lng: 20.076 },
    { name: 'Rysy', lat: 49.179, lng: 20.088 },
  ],
};

describe('day-plan.mapper', () => {
  it('maps a trek activity into a TREK block with unique pins', () => {
    const block = activityToBlock(baseActivity, 'Zakopane, Poland');
    expect(inferBlockKind(baseActivity)).toBe('TREK');
    expect(block.kind).toBe('TREK');
    expect(block.pins.length).toBeGreaterThanOrEqual(3);
    const urls = block.pins.map((pin) => pin.mapsUrl);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url && !url.includes('Zakopane%2C%20Zakopane'))).toBe(true);
  });

  it('maps food to a FOOD block with a restaurant pin', () => {
    const block = activityToBlock(
      {
        ...baseActivity,
        type: 'FOOD',
        title: 'A Baiuca',
        placeName: 'A Baiuca',
        routeWaypoints: [],
        formattedAddress: 'Rua da Bica 4, Lisbon',
        lat: 38.711,
        lng: -9.144,
      },
      'Lisbon, Portugal',
    );
    expect(block.kind).toBe('FOOD');
    expect(block.pins[0]?.role).toBe('RESTAURANT');
    expect(block.pins[0]?.mapsUrl).toContain('38.711');
  });

  it('builds a day plan from a legacy itinerary payload', () => {
    const itinerary: TripItinerary = {
      tripId: 1,
      title: 'Tatra trek',
      destination: 'Zakopane, Poland',
      selectedProposalType: 'BALANCED',
      totalDays: 1,
      days: [
        {
          dayNumber: 1,
          date: '2026-08-04',
          themeKeywords: 'Rysy · Early start · Hut lunch',
          daySummary: 'Wejście od Palenicy. Start przed 8:00.',
          dailyDistanceLabel: '~14 km',
          dailyCostMin: 25,
          dailyCostMax: 40,
        },
      ],
      activities: [baseActivity],
    };

    const plan = toDayPlan(itinerary, 1);
    expect(plan.themes).toEqual(['Rysy', 'Early start', 'Hut lunch']);
    expect(plan.stats.durationLabel).toBe('~14 km');
    expect(plan.blocks[0]?.pins.length).toBeGreaterThan(1);
  });
});
