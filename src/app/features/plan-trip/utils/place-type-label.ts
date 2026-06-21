export function placeTypeLabel(placeType: string | null | undefined): string | null {
  if (!placeType) {
    return null;
  }

  const labels: Record<string, string> = {
    city: 'City',
    town: 'City',
    village: 'Town',
    mountain: 'Mountain',
    peak: 'Mountain',
    ridge: 'Mountain',
    lake: 'Lake',
    water: 'Lake',
    reservoir: 'Lake',
    region: 'Region',
    state: 'Region',
    county: 'Region',
    park: 'National park',
    national_park: 'National park',
  };

  return labels[placeType.toLowerCase()] ?? 'Place';
}
