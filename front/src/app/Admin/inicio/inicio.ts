import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio-admin',
  imports: [RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class InicioAdmin {
  nombreAdmin: string = '';
  // Estado del panel móvil del navbar
  mobileOpen: boolean = false;
  constructor(private auth: AuthService, private perfil: PerfilService){
    this.perfil.cargarPerfil();
    setTimeout(()=>{
      const p = this.perfil.perfil();
      if(p) this.nombreAdmin = p.nombreCompleto;
    },300);
  }
  logout(){ this.auth.logout(); }
  toggleMobile(){ this.mobileOpen = !this.mobileOpen; }
  closeMobile(){ this.mobileOpen = false; }
}
