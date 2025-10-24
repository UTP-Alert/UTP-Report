import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { RouterModule } from '@angular/router';
import { ReportesAsignados } from './reportes-asignados/reportes-asignados';

@Component({
  selector: 'app-inicio-seguridad',
  imports: [RouterModule, ReportesAsignados],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class InicioSeguridad {
  nombreSeguridad: string = '';
  secLabel: string = 'Sec.';
  constructor(public auth: AuthService, private perfil: PerfilService){
    this.perfil.cargarPerfil();
    setTimeout(()=>{
      const p = this.perfil.perfil();
      if(p){
        this.nombreSeguridad = p.nombreCompleto;
        const nombre = this.nombreSeguridad?.trim() || '';
        this.secLabel = `Sec. ${nombre || 'Seguridad'}`;
      } else {
        this.secLabel = 'Sec. Seguridad';
      }
    },300);
  }
  logout(){ this.auth.logout(); }
}
