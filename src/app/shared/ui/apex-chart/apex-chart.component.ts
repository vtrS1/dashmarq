import { Component, ElementRef, afterNextRender, effect, input, viewChild } from '@angular/core';
import type ApexChartsCtor from 'apexcharts';
import type { ApexOptions } from 'apexcharts';

/**
 * Thin standalone wrapper around the ApexCharts core library.
 *
 * `apexcharts` is imported dynamically inside `afterNextRender` (browser-only)
 * so the SSR bundle never touches its `window`/`document` references.
 */
@Component({
  selector: 'app-apex-chart',
  template: `<div #chartEl></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class ApexChartComponent {
  readonly options = input.required<ApexOptions>();

  private readonly chartEl = viewChild.required<ElementRef<HTMLDivElement>>('chartEl');
  private chart: ApexChartsCtor | undefined;

  constructor() {
    afterNextRender(async () => {
      const mod: any = await import('apexcharts');
      const ApexCharts: typeof ApexChartsCtor = mod.default ?? mod;
      this.chart = new ApexCharts(this.chartEl().nativeElement, this.options());
      await this.chart.render();
    });

    effect(() => {
      const opts = this.options();
      this.chart?.updateOptions(opts, true, true, true);
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
