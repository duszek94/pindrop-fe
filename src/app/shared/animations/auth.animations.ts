import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const fadeSlideIn = trigger('fadeSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('500ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('400ms ease-out', style({ opacity: 1 })),
  ]),
]);

export const staggerFadeSlide = trigger('staggerFadeSlide', [
  transition(':enter', [
    query(
      '.animate-item',
      [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        stagger(80, [
          animate('450ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.96)' }),
    animate('350ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
  ]),
]);
