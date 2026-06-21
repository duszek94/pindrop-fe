export const WIZARD_STEPS = [
  { id: 1, label: 'Destination', icon: 'pi-map-marker' },
  { id: 2, label: 'Preferences', icon: 'pi-dollar' },
  { id: 3, label: 'Interests', icon: 'pi-tags' },
] as const;

export const DESTINATION_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=640&q=80';

const KNOWN_DESTINATION_IMAGES: Record<string, string> = {
  tokyo:
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=640&q=80',
  paris:
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=640&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=640&q=80',
  barcelona:
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=640&q=80',
  lisbon:
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=640&q=80',
  reykjavik:
    'https://images.unsplash.com/photo-1529963180234-94d383b4d27c?auto=format&fit=crop&w=640&q=80',
  santorini:
    'https://images.unsplash.com/photo-1613395877344-13d30996eeaa?auto=format&fit=crop&w=640&q=80',
  kyoto:
    'https://images.unsplash.com/photo-1493976040374-85c8e78512ef?auto=format&fit=crop&w=640&q=80',
  dolomites:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=640&q=80',
  'scottish highlands':
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=640&q=80',
  prague:
    'https://images.unsplash.com/photo-1541849546449-79d4d1b6085b?auto=format&fit=crop&w=640&q=80',
};

export function resolveDestinationImage(name: string): string | undefined {
  const normalized = name.toLowerCase();
  const token = normalized.split(',')[0]?.trim() ?? normalized;

  for (const [key, imageUrl] of Object.entries(KNOWN_DESTINATION_IMAGES)) {
    if (normalized.includes(key) || token.includes(key) || key.includes(token)) {
      return imageUrl;
    }
  }

  return undefined;
}
