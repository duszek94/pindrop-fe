import { uniquifyPins } from './pin-enricher';

describe('uniquifyPins', () => {
  it('drops destination-named pins and keeps unique maps URLs', () => {
    const pins = uniquifyPins(
      [
        { name: 'Harbor square', role: 'STOP', lat: 38.708, lng: -9.136 },
        { name: 'Arcade street', role: 'STOP', lat: 38.711, lng: -9.139 },
        { name: 'Lisbon', role: 'STOP', lat: 38.722, lng: -9.139 },
      ],
      'Lisbon, Portugal',
    );
    expect(pins.map((pin) => pin.name)).toEqual(['Harbor square', 'Arcade street']);
    expect(new Set(pins.map((pin) => pin.mapsUrl)).size).toBe(2);
  });

  it('splits identical coordinate URLs by falling back to the pin name', () => {
    const pins = uniquifyPins(
      [
        { name: 'Trailhead parking', role: 'PARKING', lat: 49.3, lng: 19.95 },
        { name: 'Mountain hut', role: 'HUT', lat: 49.3, lng: 19.95 },
      ],
      'Zakopane, Poland',
    );
    expect(pins[0]?.mapsUrl).not.toBe(pins[1]?.mapsUrl);
    expect(pins[1]?.mapsUrl).toContain('Mountain');
  });
});
