import type { DayPin } from '../../../core/models/plan-trip.models';
import { isDestinationOnlyName, withResolvedMapsUrl } from './maps-url';

/** Client-side pin enricher: drop destination-named pins and keep unique Maps URLs. */
export function uniquifyPins(pins: DayPin[], destination: string): DayPin[] {
  const seen = new Set<string>();
  return pins
    .filter((pin) => !!pin.name?.trim() && !isDestinationOnlyName(pin.name, destination))
    .map((pin) => {
      let resolved = withResolvedMapsUrl(pin, destination);
      if (resolved.mapsUrl && seen.has(resolved.mapsUrl)) {
        resolved = withResolvedMapsUrl(
          { ...pin, lat: null, lng: null, placeId: null, mapsUrl: null },
          destination,
        );
      }
      if (resolved.mapsUrl) {
        seen.add(resolved.mapsUrl);
      }
      return resolved;
    });
}
