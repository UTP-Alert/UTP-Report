export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

export interface ReportStatusCount {
  status: string;
  count: number;
}

export interface ZoneCount {
  zoneName: string;
  count: number;
}

export interface ReportsSentCount {
  date: string;
  count: number;
}
