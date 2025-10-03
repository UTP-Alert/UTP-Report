import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio-seguridad',
  imports: [RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class InicioSeguridad {
  nombreSeguridad: string = '';
  constructor(private auth: AuthService, private perfil: PerfilService){
    this.perfil.cargarPerfil();
    setTimeout(()=>{
      const p = this.perfil.perfil();
      if(p) this.nombreSeguridad = p.nombreCompleto;
    },300);
  }
  logout(){ this.auth.logout(); }
}
