import type { WizardDestinationForm } from '../../core/models/plan-trip.models';
import { DEFAULT_ARRIVAL_TIME, DEFAULT_DEPARTURE_TIME } from '../../core/models/plan-trip.models';

export type PlanTripDateField = 'startDate' | 'endDate';
export type PlanTripTimeField = 'arrivalTime' | 'departureTime';

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function stripTime(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function parseInputDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isBeforeToday(date: Date): boolean {
  return stripTime(date).getTime() < startOfToday().getTime();
}

export function parseInputTime(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

export function getDateFieldErrorKey(
  field: PlanTripDateField,
  startDate: Date | null,
  endDate: Date | null,
): string | null {
  if (field === 'startDate') {
    if (!startDate) {
      return 'validation.planTrip.startDate.required';
    }
    if (isBeforeToday(startDate)) {
      return 'validation.planTrip.startDate.past';
    }
    return null;
  }

  if (!endDate) {
    return 'validation.planTrip.endDate.required';
  }
  if (isBeforeToday(endDate)) {
    return 'validation.planTrip.endDate.past';
  }
  if (startDate && stripTime(endDate).getTime() < stripTime(startDate).getTime()) {
    return 'validation.planTrip.endDate.beforeStart';
  }

  return null;
}

export function getArrivalTimeErrorKey(form: WizardDestinationForm): string | null {
  if (!form.arrivalTime?.trim()) {
    return 'validation.planTrip.arrivalTime.required';
  }

  if (!parseInputTime(form.arrivalTime)) {
    return 'validation.planTrip.arrivalTime.invalid';
  }

  return null;
}

export function getDepartureTimeErrorKey(form: WizardDestinationForm): string | null {
  if (!form.departureTime?.trim()) {
    return 'validation.planTrip.departureTime.required';
  }

  if (!parseInputTime(form.departureTime)) {
    return 'validation.planTrip.departureTime.invalid';
  }

  return null;
}

export function getSameDayTimeOrderErrorKey(form: WizardDestinationForm): string | null {
  if (!form.startDate || !form.endDate) {
    return null;
  }

  if (stripTime(form.startDate).getTime() !== stripTime(form.endDate).getTime()) {
    return null;
  }

  const arrival = parseInputTime(form.arrivalTime);
  const departure = parseInputTime(form.departureTime);
  if (!arrival || !departure) {
    return null;
  }

  const arrivalMinutes = arrival.hours * 60 + arrival.minutes;
  const departureMinutes = departure.hours * 60 + departure.minutes;
  if (arrivalMinutes >= departureMinutes) {
    return 'validation.planTrip.departureTime.beforeArrival';
  }

  return null;
}

export function getDestinationErrorKey(form: WizardDestinationForm): string | null {
  if (!form.destination.trim()) {
    return 'validation.planTrip.destination.required';
  }

  if (form.lat === 0 && form.lng === 0) {
    return 'validation.planTrip.destination.pickFromList';
  }

  return null;
}

export function validateDestinationStep(form: WizardDestinationForm): string | null {
  const destinationError = getDestinationErrorKey(form);
  if (destinationError) {
    return destinationError;
  }

  const startError = getDateFieldErrorKey('startDate', form.startDate, form.endDate);
  if (startError) {
    return startError;
  }

  const endError = getDateFieldErrorKey('endDate', form.startDate, form.endDate);
  if (endError) {
    return endError;
  }

  const arrivalError = getArrivalTimeErrorKey(form);
  if (arrivalError) {
    return arrivalError;
  }

  const departureError = getDepartureTimeErrorKey(form);
  if (departureError) {
    return departureError;
  }

  return getSameDayTimeOrderErrorKey(form);
}

export function getFirstDestinationErrorFieldId(form: WizardDestinationForm): string | null {
  if (getDestinationErrorKey(form)) {
    return 'destination';
  }

  if (getDateFieldErrorKey('startDate', form.startDate, form.endDate)) {
    return 'startDate';
  }

  if (getDateFieldErrorKey('endDate', form.startDate, form.endDate)) {
    return 'endDate';
  }

  if (getArrivalTimeErrorKey(form)) {
    return 'arrivalTime';
  }

  if (getDepartureTimeErrorKey(form) || getSameDayTimeOrderErrorKey(form)) {
    return 'departureTime';
  }

  return null;
}

export function minEndDate(startDate: Date | null): string {
  const today = startOfToday();
  if (!startDate || stripTime(startDate).getTime() < today.getTime()) {
    return formatDateLocal(today);
  }

  return formatDateLocal(startDate);
}

export function normalizeTimeValue(value: string): string {
  const parsed = parseInputTime(value);
  if (!parsed) {
    return value.trim();
  }

  return `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`;
}

export function createDefaultDestinationForm(): WizardDestinationForm {
  return {
    destination: '',
    placeType: null,
    lat: 0,
    lng: 0,
    startDate: null,
    endDate: null,
    arrivalTime: DEFAULT_ARRIVAL_TIME,
    departureTime: DEFAULT_DEPARTURE_TIME,
  };
}
