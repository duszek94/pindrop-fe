import { buildPinMapsUrl, isDestinationOnlyName } from './maps-url';

describe('buildPinMapsUrl', () => {
  it('prefers placeId over text query', () => {
    const url = buildPinMapsUrl(
      { name: 'Lake Geneva', role: 'STOP', placeId: 'ChIJswiss' },
      'Lake Geneva, Vaud, Switzerland',
    );
    expect(url).toContain('query_place_id=ChIJswiss');
    expect(url).not.toContain('Lake%20Geneva%2C%20Lake%20Geneva');
  });

  it('uses coordinates instead of destination-only text', () => {
    const url = buildPinMapsUrl(
      { name: 'Lake Geneva', role: 'STOP', lat: 46.4414, lng: 6.5295 },
      'Lake Geneva, Vaud, Switzerland',
    );
    expect(url).toBe('https://www.google.com/maps/search/?api=1&query=46.4414,6.5295');
  });

  it('never builds Lake Geneva, Lake Geneva', () => {
    const url = buildPinMapsUrl(
      { name: 'Lake Geneva', role: 'STOP', address: 'Lake Geneva' },
      'Lake Geneva, Vaud, Switzerland',
    );
    expect(url).toContain('Switzerland');
    expect(url).not.toContain('Lake%20Geneva%2C%20Lake%20Geneva');
  });

  it('detects destination-only names', () => {
    expect(isDestinationOnlyName('Lake Geneva', 'Lake Geneva, Vaud, Switzerland')).toBe(true);
    expect(isDestinationOnlyName('Palenica Białczańska', 'Zakopane, Poland')).toBe(false);
  });
});
