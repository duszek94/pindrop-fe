import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';

import type { DayPin } from '../../../../core/models/plan-trip.models';

@Component({
  selector: 'app-day-minimap',
  template: `<div #mapHost class="day-minimap" aria-label="Day map"></div>`,
  styles: [
    `
      .day-minimap {
        width: 100%;
        height: 12rem;
        border-radius: 0.75rem;
        border: 1px solid rgb(42 52 65 / 80%);
        overflow: hidden;
        background: #0f172a;
      }
    `,
  ],
})
export class DayMinimapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) pins: DayPin[] = [];
  @ViewChild('mapHost') private mapHost?: ElementRef<HTMLElement>;

  private map?: L.Map;
  private markers = L.layerGroup();

  ngAfterViewInit(): void {
    if (!this.mapHost) {
      return;
    }
    this.map = L.map(this.mapHost.nativeElement, {
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(this.map);
    this.markers.addTo(this.map);
    this.renderPins();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pins'] && this.map) {
      this.renderPins();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private renderPins(): void {
    if (!this.map) {
      return;
    }
    this.markers.clearLayers();
    const points = this.pins.filter((pin) => pin.lat != null && pin.lng != null) as (DayPin & { lat: number; lng: number })[];
    if (!points.length) {
      return;
    }
    const bounds = L.latLngBounds([]);
    for (const pin of points) {
      const marker = L.circleMarker([pin.lat, pin.lng], {
        radius: 7,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.9,
        weight: 2,
      }).bindTooltip(pin.name);
      this.markers.addLayer(marker);
      bounds.extend([pin.lat, pin.lng]);
    }
    this.map.fitBounds(bounds.pad(0.25), { maxZoom: 13 });
  }
}
