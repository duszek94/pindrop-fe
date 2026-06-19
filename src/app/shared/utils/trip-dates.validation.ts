import type { WizardDestinationForm } from '../../core/models/plan-trip.models';

export type PlanTripDateField = 'startDate' | 'endDate';
export type PlanTripDestinationField = 'destination';

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

  return getDateFieldErrorKey('endDate', form.startDate, form.endDate);
}

export function minEndDate(startDate: Date | null): string {
  const today = startOfToday();
  if (!startDate || stripTime(startDate).getTime() < today.getTime()) {
    return formatDateLocal(today);
  }

  return formatDateLocal(startDate);
}
