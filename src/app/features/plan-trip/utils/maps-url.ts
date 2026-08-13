import type { DayPin } from '../../../core/models/plan-trip.models';

function destinationCountry(destination: string | null | undefined): string | null {
  if (!destination?.trim()) {
    return null;
  }
  const parts = destination.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

function destinationCity(destination: string | null | undefined): string | null {
  if (!destination?.trim()) {
    return null;
  }
  return destination.split(',')[0]?.trim() || null;
}

function normalize(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isDestinationOnlyName(name: string | null | undefined, destination: string | null | undefined): boolean {
  const normalizedName = normalize(name);
  const city = normalize(destinationCity(destination));
  return !!normalizedName && !!city && normalizedName === city;
}

export function buildPinMapsUrl(pin: DayPin, destination?: string | null): string {
  if (pin.placeId?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(pin.placeId.trim())}`;
  }
  if (pin.lat != null && pin.lng != null && (Math.abs(pin.lat) > 0.0001 || Math.abs(pin.lng) > 0.0001)) {
    return `https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lng}`;
  }

  const name = pin.name?.trim() || '';
  const address = pin.address?.trim() || '';
  const country = destinationCountry(destination);
  const city = destinationCity(destination);

  if (name && address && normalize(name) !== normalize(address)) {
    const query = country && !address.toLowerCase().includes(country.toLowerCase())
      ? `${name}, ${address}, ${country}`
      : `${name}, ${address}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  if (name && !isDestinationOnlyName(name, destination) && destination) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${destination}`)}`;
  }

  if (name && country) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${country}`)}`;
  }

  if (destination) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
  }

  if (city) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city)}`;
  }

  return pin.mapsUrl ?? '';
}

export function withResolvedMapsUrl(pin: DayPin, destination?: string | null): DayPin {
  return {
    ...pin,
    mapsUrl: buildPinMapsUrl(pin, destination) || pin.mapsUrl || null,
  };
}
