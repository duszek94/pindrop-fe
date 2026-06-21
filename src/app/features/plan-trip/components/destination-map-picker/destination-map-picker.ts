import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import * as L from 'leaflet';

import { PlanTripApiService } from '../../../../core/api/plan-trip-api.service';
import type { PlaceResult } from '../../../../core/models/plan-trip.models';

const DEFAULT_LAT = 52.2297;
const DEFAULT_LNG = 21.0122;

@Component({
  selector: 'app-destination-map-picker',
  templateUrl: './destination-map-picker.html',
  styleUrl: './destination-map-picker.scss',
})
export class DestinationMapPickerComponent implements AfterViewInit, OnDestroy {
  @Input() initialLat?: number;
  @Input() initialLng?: number;
  @Output() closed = new EventEmitter<void>();
  @Output() placeSelected = new EventEmitter<PlaceResult>();

  @ViewChild('mapHost') private mapHost?: ElementRef<HTMLElement>;

  private readonly planTripApi = inject(PlanTripApiService);
  private map?: L.Map;
  private marker?: L.Marker;

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pinLabel = signal<string | null>(null);

  ngAfterViewInit(): void {
    if (!this.mapHost) {
      return;
    }

    const hasInitial =
      this.initialLat != null &&
      this.initialLng != null &&
      (this.initialLat !== 0 || this.initialLng !== 0);

    if (hasInitial) {
      this.initMap(this.initialLat!, this.initialLng!, 10);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.initMap(position.coords.latitude, position.coords.longitude, 11);
        },
        () => {
          this.initMap(DEFAULT_LAT, DEFAULT_LNG, 5);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60_000 },
      );
      return;
    }

    this.initMap(DEFAULT_LAT, DEFAULT_LNG, 5);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  protected close(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected confirmSelection(): void {
    if (!this.marker || this.loading()) {
      return;
    }

    const { lat, lng } = this.marker.getLatLng();
    this.loading.set(true);
    this.error.set(null);

    this.planTripApi.reversePlace(lat, lng).subscribe({
      next: (place) => {
        this.loading.set(false);
        this.placeSelected.emit(place);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not resolve this location. Try another spot on the map.');
      },
    });
  }

  private initMap(lat: number, lng: number, zoom: number): void {
    if (!this.mapHost || this.map) {
      return;
    }

    this.map = L.map(this.mapHost.nativeElement, {
      center: [lat, lng],
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], {
      draggable: true,
      icon: this.createPinIcon(),
      autoPan: true,
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      this.error.set(null);
      this.updatePinPreview();
    });

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.marker?.setLatLng(event.latlng);
      this.error.set(null);
      this.updatePinPreview();
    });

    requestAnimationFrame(() => this.map?.invalidateSize());
    this.updatePinPreview();
  }

  private createPinIcon(): L.DivIcon {
    return L.divIcon({
      className: 'destination-map-picker__pin',
      html: `<span class="destination-map-picker__pin-dot" aria-hidden="true"></span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  private updatePinPreview(): void {
    if (!this.marker) {
      return;
    }

    const { lat, lng } = this.marker.getLatLng();
    this.pinLabel.set(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }
}
