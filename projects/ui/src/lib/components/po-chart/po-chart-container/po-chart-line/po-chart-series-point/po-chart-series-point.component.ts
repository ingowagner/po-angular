import { Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { Observable, from, timer } from 'rxjs';
import { concatMap, mapTo, scan, tap } from 'rxjs/operators';

import { convertToBoolean, isIE } from '../../../../../utils/util';

import { PoChartPointsCoordinates } from '../../../interfaces/po-chart-points-coordinates.interface';

const RADIUS_DEFAULT_SIZE = 5;
const RADIUS_HOVER_SIZE = 10;
const ANIMATION_DURATION_TIME = 700;

@Component({
  selector: '[po-chart-series-point]',
  templateUrl: './po-chart-series-point.component.svg',
  standalone: false
})
export class PoChartSeriesPointComponent {
  @Input('p-animate') animate: boolean;

  @Input({ alias: 'p-is-active', transform: convertToBoolean }) isActive?: boolean;

  @Input({ alias: 'p-is-fixed', transform: convertToBoolean }) isFixed?: boolean;

  @Input({ alias: 'p-chart-line', transform: convertToBoolean }) chartLine: boolean = false;

  // Referência para o svgPathGroup ao qual pertence o ponto. Necessário para reordenação dos svgElements no DOM para tratamento onHover
  @Input('p-relative-to') relativeTo: string;

  @Output('p-point-click') pointClick = new EventEmitter<any>();

  @Output('p-point-hover') pointHover = new EventEmitter<any>();

  coordinates$: Observable<Array<PoChartPointsCoordinates>>;
  radius: number = RADIUS_DEFAULT_SIZE;
  strokeColor: string;

  textWidth: number = 0;
  textHeight: number = 0;

  private _color: string;
  private _coordinates: Array<PoChartPointsCoordinates> = [];

  private animationState: boolean = true;

  @Input('p-color') set color(value: string) {
    this.strokeColor = value.includes('po-color') ? value.replace('po-color', 'po-border-color') : value;
    this._color = value;
  }

  get color() {
    return this._color;
  }

  @Input('p-coordinates') set coordinates(value: Array<PoChartPointsCoordinates>) {
    this._coordinates = value;

    this.coordinates$ = this.displayPointsWithDelay(this._coordinates);

    setTimeout(() => {
      this._coordinates.forEach(item => this.updateTextDimensions(item));
    });
  }

  get coordinates() {
    return this._coordinates;
  }

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  trackBy(index) {
    return index;
  }

  onClick(point: PoChartPointsCoordinates) {
    const selectedItem = { label: point.label, data: point.data, category: point.category };

    this.pointClick.emit(selectedItem);
  }

  onMouseEnter(event: any, point: PoChartPointsCoordinates) {
    this.updateTextDimensions(point);
    this.setPointAttribute(event.target, true);

    const selectedItem = { label: point.label, data: point.data, category: point.category };
    this.pointHover.emit({ relativeTo: this.relativeTo, ...selectedItem });
  }

  onMouseLeave(event: any) {
    this.setPointAttribute(event.target, false);
  }

  private displayPointsWithDelay(
    coordinates: Array<PoChartPointsCoordinates>
  ): Observable<Array<PoChartPointsCoordinates>> {
    if (this.animationState && !isIE()) {
      const animationTimer = ANIMATION_DURATION_TIME / coordinates.length;

      return from(coordinates).pipe(
        concatMap((item, index) => timer(index === 0 || !this.animate ? 0 : animationTimer).pipe(mapTo(item))),
        scan((acc, curr: PoChartPointsCoordinates) => acc.concat(curr), []),
        tap(() => (this.animationState = false))
      );
    } else {
      return from([coordinates]);
    }
  }

  private setPointAttribute(target: SVGElement, isHover: boolean) {
    this.renderer.setAttribute(
      target,
      'r',
      isHover && !this.isFixed ? RADIUS_HOVER_SIZE.toString() : RADIUS_DEFAULT_SIZE.toString()
    );
    if (this.color.includes('po-color')) {
      this.renderer.setAttribute(
        target,
        'class',
        isHover ? `${this.strokeColor} ${this.color}` : `po-chart-line-point po-chart-active-point ${this.strokeColor}`
      );
    } else {
      this.renderer[isHover ? 'setStyle' : 'removeStyle'](target, 'fill', isHover ? this.color : undefined);
    }
  }

  updateTextDimensions(item: PoChartPointsCoordinates) {
    const svgText = this.elementRef.nativeElement.querySelector(`.po-chart-series-point-text[data-id="${item.label}"]`);
    if (svgText) {
      const bbox = svgText.getBBox();
      this.textWidth = bbox.width;
      this.textHeight = bbox.height;
    }
  }
}
