import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-role-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-rol.html',
  styleUrl: './select-rol.scss'
})
export class RoleSelectorComponent {
  constructor(private router: Router, private auth: AuthService,  private toastr: ToastrService) {}

  goAsUser(){
    this.auth.setAdminActingAsUser(true);
    this.auth.setAdminRoleSelected(true);
    this.router.navigate(['/usuario'], { replaceUrl: true });
    this.toastr.success('Login exitoso', 'Éxito'); // Success toast
    this.toastr.success('Bienvenido al área de Usuario', 'Éxito'); // Dashboard entry toast
  }
  goAsAdmin(){
    this.auth.setAdminActingAsUser(false);
    this.auth.setAdminRoleSelected(true);
    this.router.navigate(['/admin'], { replaceUrl: true });
    this.toastr.success('Login exitoso', 'Éxito'); // Success toast
    this.toastr.success('Bienvenido al Dashboard de Administrador', 'Éxito'); // Dashboard entry toast
  }
  backLogin(){
    this.auth.logout();
  }
}