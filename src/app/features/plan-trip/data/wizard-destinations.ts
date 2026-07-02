export const WIZARD_STEPS = [
  { id: 1, label: 'Destination', icon: 'pi-map-marker' },
  { id: 2, label: 'Preferences', icon: 'pi-dollar' },
  { id: 3, label: 'Interests', icon: 'pi-tags' },
] as const;

export const DESTINATION_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=640&q=80';

const MAP_IMAGE_PATTERN =
  /\/map|map_|_map\.|location_map|relief_location|geology_map|staticmap|openstreetmap|\.svg(?:\?|$)/i;

export function isLikelyMapImage(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }

  return MAP_IMAGE_PATTERN.test(url);
}

export function resolveDestinationPhoto(
  destination: { photoUrl?: string | null },
  fallback = DESTINATION_IMAGE_FALLBACK,
): string {
  const photoUrl = destination.photoUrl;
  if (photoUrl && !isLikelyMapImage(photoUrl)) {
    return photoUrl;
  }

  return fallback;
}
