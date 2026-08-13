import type {
  ActivityDomain,
  DayBlock,
  DayBlockKind,
  DayBlockLink,
  DayPin,
  DayPinRole,
  DayPlan,
  ItineraryActivity,
  ItineraryDaySummary,
  TripItinerary,
} from '../../../core/models/plan-trip.models';
import { isDestinationOnlyName, withResolvedMapsUrl } from './maps-url';

const TREK_HINTS = ['trek', 'trail', 'hike', 'summit', 'mountain', 'via ferrata', 'ridge'];
const WALK_HINTS = ['walk', 'stroll', 'baixa', 'old town', 'neighborhood', 'promenade'];
const MUSEUM_HINTS = ['museum', 'gallery', 'exhibit'];
const BEACH_HINTS = ['beach', 'swim', 'snorkel', 'coast'];
const CAMP_HINTS = ['camp', 'tent', 'bivouac'];
const EVENING_HINTS = ['evening', 'nightlife', 'sunset', 'dinner'];
const ARRIVAL_HINTS = ['check in', 'arrival', 'orient'];
const PARKING_HINTS = ['parking', 'trailhead', 'car park'];
const HUT_HINTS = ['hut', 'schronisko', 'refuge', 'rifugio'];
const SHOP_HINTS = ['shop', 'market', 'grocery', 'lewiatan'];

function haystack(activity: ItineraryActivity): string {
  return [activity.title, activity.placeName, activity.activityDomain, activity.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function includesAny(value: string, hints: string[]): boolean {
  return hints.some((hint) => value.includes(hint));
}

export function inferBlockKind(activity: ItineraryActivity): DayBlockKind {
  if (activity.type === 'FOOD') {
    return 'FOOD';
  }
  if (activity.type === 'TRANSPORT') {
    return 'TRANSIT';
  }
  if (activity.type === 'ACCOMMODATION') {
    return 'ARRIVAL';
  }

  const text = haystack(activity);
  const domain = (activity.activityDomain ?? '').toUpperCase();

  if (domain.includes('TREK') || domain.includes('MOUNTAIN') || domain.includes('TRAIL') || includesAny(text, TREK_HINTS)) {
    return 'TREK';
  }
  if (domain.includes('MUSEUM') || includesAny(text, MUSEUM_HINTS)) {
    return 'MUSEUM';
  }
  if (domain.includes('BEACH') || includesAny(text, BEACH_HINTS)) {
    return 'BEACH';
  }
  if (domain.includes('CAMP') || includesAny(text, CAMP_HINTS)) {
    return 'CAMP';
  }
  if (includesAny(text, ARRIVAL_HINTS)) {
    return 'ARRIVAL';
  }
  if (includesAny(text, EVENING_HINTS) || (activity.startTime?.slice(0, 2) ?? '00') >= '18') {
    return 'EVENING';
  }
  if (activity.slotKind === 'REST') {
    return 'REST';
  }
  if (domain.includes('CITY') || includesAny(text, WALK_HINTS) || activity.visitStyle === 'SELF_GUIDED') {
    return 'CITY_WALK';
  }
  return 'CITY_WALK';
}

export function inferPinRole(name: string, kind: DayBlockKind): DayPinRole {
  const text = name.toLowerCase();
  if (includesAny(text, PARKING_HINTS)) {
    return 'PARKING';
  }
  if (includesAny(text, HUT_HINTS)) {
    return 'HUT';
  }
  if (includesAny(text, SHOP_HINTS)) {
    return 'SHOP';
  }
  if (kind === 'FOOD' || text.includes('restaurant') || text.includes('meal')) {
    return 'RESTAURANT';
  }
  if (kind === 'MUSEUM') {
    return 'MUSEUM';
  }
  if (kind === 'BEACH') {
    return 'BEACH';
  }
  if (kind === 'CAMP') {
    return 'CAMP';
  }
  if (kind === 'ARRIVAL') {
    return 'LODGING';
  }
  if (kind === 'TREK' && (text.includes('view') || text.includes('peak') || text.includes('summit'))) {
    return 'VIEWPOINT';
  }
  if (kind === 'TREK') {
    return 'TRAILHEAD';
  }
  return 'STOP';
}

function toLinks(activity: ItineraryActivity): DayBlockLink[] {
  if (activity.externalLinks?.length) {
    return activity.externalLinks.map((link) => ({
      type: link.type,
      url: link.url,
      label: link.label,
    }));
  }
  return (activity.sources ?? []).map((url) => ({
    type: 'ARTICLE' as const,
    url,
    label: url,
  }));
}

function pinsFromActivity(
  activity: ItineraryActivity,
  kind: DayBlockKind,
  destination: string,
): DayPin[] {
  const pins: DayPin[] = [];
  const waypoints = activity.routeWaypoints ?? [];

  for (const point of waypoints) {
    if (!point?.name?.trim()) {
      continue;
    }
    pins.push(
      withResolvedMapsUrl(
        {
          name: point.name.trim(),
          role: inferPinRole(point.name, kind),
          lat: point.lat ?? null,
          lng: point.lng ?? null,
        },
        destination,
      ),
    );
  }

  const placeName = activity.placeName?.trim() || '';
  const alreadyListed = pins.some((pin) => pin.name.toLowerCase() === placeName.toLowerCase());
  if (placeName && !alreadyListed && !isDestinationOnlyName(placeName, destination)) {
    pins.unshift(
      withResolvedMapsUrl(
        {
          name: placeName,
          role: inferPinRole(placeName, kind),
          lat: activity.lat,
          lng: activity.lng,
          placeId: activity.placeId,
          address: activity.formattedAddress,
          mapsUrl: activity.mapsUrl,
        },
        destination,
      ),
    );
  } else if (placeName && !alreadyListed && (activity.lat != null || activity.placeId)) {
    pins.unshift(
      withResolvedMapsUrl(
        {
          name: activity.title,
          role: inferPinRole(activity.title, kind),
          lat: activity.lat,
          lng: activity.lng,
          placeId: activity.placeId,
          address: activity.formattedAddress,
        },
        destination,
      ),
    );
  } else if (!pins.length && activity.lat != null && activity.lng != null) {
    pins.push(
      withResolvedMapsUrl(
        {
          name: activity.title,
          role: inferPinRole(activity.title, kind),
          lat: activity.lat,
          lng: activity.lng,
          placeId: activity.placeId,
          address: activity.formattedAddress,
        },
        destination,
      ),
    );
  }

  return pins.filter((pin, index, list) => {
    const key = `${pin.name.toLowerCase()}|${pin.lat ?? ''}|${pin.lng ?? ''}|${pin.placeId ?? ''}`;
    return list.findIndex((candidate) => {
      const candidateKey = `${candidate.name.toLowerCase()}|${candidate.lat ?? ''}|${candidate.lng ?? ''}|${candidate.placeId ?? ''}`;
      return candidateKey === key;
    }) === index;
  });
}

export function activityToBlock(activity: ItineraryActivity, destination: string): DayBlock {
  const kind = inferBlockKind(activity);
  const optional = activity.optional || activity.slotKind === 'OPTIONAL' || activity.slotKind === 'CONTINGENCY';
  return {
    id: activity.id,
    kind,
    startTime: activity.startTime,
    endTime: activity.endTime,
    flexibility: activity.timeFlexibility,
    title: activity.title,
    narrative: activity.description,
    logistics: [activity.why, ...(activity.tips ?? [])].filter(Boolean).join(' '),
    costLabel: activity.costLabel ?? activity.optionalAddons,
    costMin: activity.costMin,
    costMax: activity.costMax,
    photoUrl: activity.photoUrl,
    photoConfidence: activity.photoConfidence,
    routeSummary: activity.routeSummary,
    links: toLinks(activity),
    pins: pinsFromActivity(activity, kind, destination),
    alternatives: optional
      ? [
          {
            id: activity.id,
            kind,
            startTime: activity.startTime,
            endTime: activity.endTime,
            title: activity.title,
            narrative: activity.description,
            links: [],
            pins: [],
            alternatives: [],
          },
        ]
      : [],
  };
}

function themesFrom(day: ItineraryDaySummary | undefined): string[] {
  return (day?.themeKeywords ?? '')
    .split(/[·|,]/)
    .map((theme) => theme.trim())
    .filter(Boolean);
}

export function toDayPlan(itinerary: TripItinerary, dayNumber: number): DayPlan {
  if (itinerary.dayPlan && itinerary.dayPlan.dayNumber === dayNumber) {
    return {
      ...itinerary.dayPlan,
      blocks: itinerary.dayPlan.blocks.map((block) => ({
        ...block,
        pins: block.pins.map((pin) => withResolvedMapsUrl(pin, itinerary.destination)),
        alternatives: block.alternatives ?? [],
        links: block.links ?? [],
      })),
    };
  }

  const summary = itinerary.days.find((day) => day.dayNumber === dayNumber);
  const activities = itinerary.activities ?? [];
  return {
    dayNumber,
    date: summary?.date ?? '',
    title: summary?.themeKeywords ?? null,
    narrative: summary?.daySummary ?? null,
    themes: themesFrom(summary),
    dayRole: summary?.dayRole ?? itinerary.selectedDayRole ?? null,
    activityDomain: summary?.activityDomain ?? itinerary.selectedActivityDomain ?? null,
    stats: {
      durationLabel: summary?.dailyDistanceLabel ?? null,
      costMin: summary?.dailyCostMin ?? null,
      costMax: summary?.dailyCostMax ?? null,
      currency: 'EUR',
    },
    blocks: activities.map((activity) => activityToBlock(activity, itinerary.destination)),
  };
}

export function playbookLabel(kind: DayBlockKind): string {
  return kind.replaceAll('_', ' ');
}

export function pinRoleLabel(role: DayPinRole): string {
  return role.replaceAll('_', ' ').toLowerCase();
}

export function domainPlaybook(domain: ActivityDomain | null | undefined): DayBlockKind | null {
  if (!domain) {
    return null;
  }
  const value = domain.toUpperCase();
  if (value.includes('TREK') || value.includes('MOUNTAIN') || value.includes('TRAIL')) {
    return 'TREK';
  }
  if (value.includes('MUSEUM')) {
    return 'MUSEUM';
  }
  if (value.includes('BEACH')) {
    return 'BEACH';
  }
  if (value.includes('CAMP')) {
    return 'CAMP';
  }
  if (value.includes('CITY')) {
    return 'CITY_WALK';
  }
  return null;
}
