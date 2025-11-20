import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto';
import { ChartData } from '../../interfaces/chart-data.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.scss']
})
export class ChartCardComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() title: string = '';
  @Input() chartData: ChartData | null = null;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  private chartInstance: Chart | undefined;
  private themeObserver: MutationObserver | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData && this.chartCanvas) {
      this.renderChart();
    }
  }

  ngAfterViewInit(): void {
    if (this.chartData) {
      this.renderChart();
    }

    // Observe changes to the html class to re-render on dark-mode toggle
    const htmlEl = document.documentElement;
    this.themeObserver = new MutationObserver(() => {
      this.updateChartTheme();
    });
    this.themeObserver.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  private renderChart(): void {
    if (!this.chartCanvas || !this.chartData) {
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.chartData?.labels || [],
          datasets: this.chartData?.datasets.map(dataset => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: dataset.backgroundColor,
            borderColor: dataset.borderColor,
            borderWidth: dataset.borderWidth
          })) || []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
            x: {}
          },
          plugins: {
            legend: { display: true }
          }
        }
      });

      // Apply theme-dependent colors
      this.updateChartTheme();
    }
  }

  private updateChartTheme(): void {
    if (!this.chartInstance) return;
    const isDark = document.documentElement.classList.contains('dark-mode');
    const gridColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    const tickColor = isDark ? '#d1d5db' : '#374151';
    const legendColor = isDark ? '#f5f6f7' : '#111827';

    const scales: any = this.chartInstance.options.scales;
    if (scales) {
      if (scales.x) {
        scales.x.grid = { color: gridColor };
        scales.x.ticks = { color: tickColor };
      }
      if (scales.y) {
        scales.y.grid = { color: gridColor };
        scales.y.ticks = { color: tickColor };
      }
    }
    if (this.chartInstance.options.plugins && (this.chartInstance.options.plugins as any).legend) {
      (this.chartInstance.options.plugins as any).legend.labels = { color: legendColor };
    }
    this.chartInstance.update();
  }
}
