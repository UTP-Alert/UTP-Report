// Importa el decorador Component de Angular core para definir un componente.
import { Component, OnInit } from '@angular/core';
// Importa el servicio de autenticación para manejar la lógica de inicio y cierre de sesión.
import { AuthService } from '../../services/auth.service';
// Importa el servicio de perfil para cargar y gestionar la información del perfil del usuario.
import { PerfilService } from '../../services/perfil.service';
// Importa RouterModule para habilitar las funcionalidades de enrutamiento en el componente.
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngFor
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
// Import standalone tab components so they can be used inside the template
import { ReportesRecientes } from './reportes-recientes/reportes-recientes';
import { EnProceso } from './en-proceso/en-proceso';
import { PendAprobacion } from './pend-aprobacion/pend-aprobacion';
import { PendResueltos } from './pend-resueltos/pend-resueltos';
import { Cancelados } from './cancelados/cancelados';
// Import Chart.js related components and services
import { ChartCardComponent } from '../../shared/chart-card/chart-card.component';
import { ChartDataService } from '../../services/chart-data.service';
import { ChartData } from '../../interfaces/chart-data.interface';

// Decorador @Component que define los metadatos del componente.
@Component({
  selector: 'app-inicio-admin', // El selector CSS que se usa para instanciar este componente en una plantilla.
  standalone: true, // Indica que este es un componente independiente, no requiere un NgModule.
  imports: [
    RouterModule,
    CommonModule,
    ReportesRecientes,
    EnProceso,
    PendAprobacion,
    PendResueltos,
    Cancelados,
    ChartCardComponent // Import the standalone ChartCardComponent
  ], // Módulos y componentes que este componente importa y utiliza.
  templateUrl: './inicio.html', // La ruta al archivo de plantilla HTML de este componente.
  styleUrl: './inicio.scss' // La ruta al archivo de estilos SCSS de este componente.
})
export class InicioAdmin implements OnInit {
  nombreAdmin: string = ''; // Propiedad para almacenar el nombre completo del administrador.
  mobileOpen: boolean = false; // Estado booleano para controlar la visibilidad del panel móvil del navbar.
  activeTab: string = 'recent'; // Propiedad para controlar la pestaña activa, por defecto 'recent'.

  // Chart data properties
  reportStatusChartData: ChartData | null = null;
  zoneChartData: ChartData | null = null;
  reportsSentChartData: ChartData | null = null;

  // Constructor del componente, inyecta AuthService, PerfilService y ChartDataService.
  constructor(
    public auth: AuthService,
    private perfil: PerfilService,
    private router: Router,
    private route: ActivatedRoute,
    private chartDataService: ChartDataService // Inject ChartDataService
  ){
    this.perfil.cargarPerfil(); // Carga el perfil del usuario al inicializar el componente.
    // Establece un temporizador para obtener el nombre del administrador después de un breve retraso.
    setTimeout(()=>{
      const p = this.perfil.perfil(); // Obtiene el perfil del servicio.
      if(p) this.nombreAdmin = p.nombreCompleto; // Si el perfil existe, asigna el nombre completo.
    },300);
    // Sincroniza la pestaña inicial con la URL actual
    this.syncTabWithUrl();
    // Escucha cambios de navegación para mantener la pestaña sincronizada si la URL cambia
    this.router.events.subscribe(()=> this.syncTabWithUrl());
  }

  ngOnInit(): void {
    this.loadChartData();
  }

  private loadChartData(): void {
    // Load Report Status Count
    this.chartDataService.getReportStatusCount().subscribe(data => {
      this.reportStatusChartData = {
        labels: data.map(item => item.status),
        datasets: [{
          label: 'Cantidad de Reportes',
          data: data.map(item => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      };
    });

    // Load Zone Count
    this.chartDataService.getZoneCount().subscribe(data => {
      this.zoneChartData = {
        labels: data.map(item => item.zoneName),
        datasets: [{
          label: 'Reportes por Zona',
          data: data.map(item => item.count),
          backgroundColor: [
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderColor: [
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      };
    });

    // Load Reports Sent Count
    this.chartDataService.getReportsSentCount().subscribe(data => {
      this.reportsSentChartData = {
        labels: data.map(item => item.date),
        datasets: [{
          label: 'Reportes Enviados',
          data: data.map(item => item.count),
          backgroundColor: ['rgba(100, 200, 150, 0.6)'],
          borderColor: ['rgba(100, 200, 150, 1)'],
          borderWidth: 1
        }]
      };
    });
  }

  /**
   * Establece la pestaña activa.
   * @param tabName El nombre de la pestaña a activar.
   */
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
    // Navegar a la ruta correspondiente para que la barra de direcciones refleje la pestaña
    const pathMap: Record<string,string> = {
      'recent': '/admin/recientes',
      'in-process': '/admin/en-proceso',
      'pending-approval': '/admin/pend-aprobacion',
      'resolved': '/admin/resueltos',
      'cancelled': '/admin/cancelados'
    };
    const target = pathMap[tabName] || '/admin';
    // Use replaceUrl to avoid stacking history if lo deseas, aquí usamos push
    this.router.navigateByUrl(target, { replaceUrl: false });
  }

  // Sincroniza this.activeTab con la ruta actual
  private syncTabWithUrl(){
    try{
      const url = this.router.url || '';
      if(url.includes('/admin/en-proceso')) this.activeTab = 'in-process';
      else if(url.includes('/admin/pend-aprobacion')) this.activeTab = 'pending-approval';
      else if(url.includes('/admin/resueltos')) this.activeTab = 'resolved';
      else if(url.includes('/admin/cancelados')) this.activeTab = 'cancelled';
      else this.activeTab = 'recent';
    }catch(e){/* noop */}
  }

  /**
   * Cierra la sesión del usuario administrador.
   * Utiliza el método `logout` del `AuthService`.
   */
  logout(){ this.auth.logout(); }

  /**
   * Alterna el estado de visibilidad del panel móvil del navbar.
   */
  toggleMobile(){ this.mobileOpen = !this.mobileOpen; }

  /**
   * Cierra el panel móvil del navbar, estableciendo su estado a `false`.
   */
  closeMobile(){ this.mobileOpen = false; }
}
