export type UserRole = 'public' | 'user' | 'admin';

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
}

export interface ReportData {
  type: string;
  zone: string;
  description: string;
  photo?: File;
  anonymous: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface AlertData {
  id: string;
  type: string;
  zone: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'investigating';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ZoneData {
  id: string;
  name: string;
  status: 'safe' | 'warning' | 'danger';
  incidentCount: number;
  lastIncident?: Date;
}