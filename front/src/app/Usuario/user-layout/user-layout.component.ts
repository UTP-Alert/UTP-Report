import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent implements OnInit {
  @Input() nombreCompleto: string = 'Juan Pérez'; // luego se puede obtener desde endpoint de perfil
  @Input() tipoUsuario?: string; // ALUMNO|DOCENTE

  displayName = '';
  mobileOpen = false;

  // Estado simple para simular contador / badge de notificaciones en el futuro
  notifications = 0;

  constructor(public auth: AuthService, private router: Router, private perfilSrv: PerfilService){}
  ngOnInit(){
    this.auth.loadFromStorage();
    this.perfilSrv.cargarPerfil();
    const sub = setTimeout(()=>{
      const perfil = this.perfilSrv.perfil();
      if (perfil) {
        this.displayName = this.auth.buildDisplayName(perfil.nombreCompleto, perfil.tipoUsuario);
      } else {
        this.displayName = this.auth.buildDisplayName(this.nombreCompleto, this.tipoUsuario);
      }
    },300);
  }

  toggleMobile(){ this.mobileOpen = !this.mobileOpen; }
  closeMobile(){ this.mobileOpen = false; }
  openNotifications(){ /* placeholder: luego abrir panel lateral */ }
  reportar(){ /* placeholder: abrir modal de reporte */ alert('Acción de reporte (pendiente de implementación)'); }

  navigate(path: string){
    this.router.navigate(['/usuario', path]);
  }

  logout(){ this.auth.logout(); }
}
