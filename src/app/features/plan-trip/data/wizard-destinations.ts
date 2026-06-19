export interface WizardDestination {
  name: string;
  country: string;
  imageUrl: string;
}

export const WIZARD_DESTINATIONS: WizardDestination[] = [
  {
    name: 'Tokyo',
    country: 'Japan',
    imageUrl:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=640&q=80',
  },
  {
    name: 'Paris',
    country: 'France',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=640&q=80',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    imageUrl:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=640&q=80',
  },
  {
    name: 'New York',
    country: 'USA',
    imageUrl:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=640&q=80',
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    imageUrl:
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=640&q=80',
  },
];

export const WIZARD_STEPS = [
  { id: 1, label: 'Destination', icon: 'pi-map-marker' },
  { id: 2, label: 'Preferences', icon: 'pi-dollar' },
  { id: 3, label: 'Interests', icon: 'pi-tags' },
] as const;

export function resolveDestinationImage(name: string): string | undefined {
  const normalized = name.toLowerCase();
  return WIZARD_DESTINATIONS.find(
    (d) =>
      normalized.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(normalized.split(',')[0]?.trim() ?? ''),
  )?.imageUrl;
}
