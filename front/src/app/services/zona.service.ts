import { Injectable } from '@angular/core';

export interface Zona {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class ZonaService {
  
}
