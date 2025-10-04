import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-role-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selector.component.html',
  styleUrl: './role-selector.component.scss'
})
export class RoleSelectorComponent {
  constructor(private router: Router, private auth: AuthService) {}

  goAsUser(){
    this.auth.setAdminActingAsUser(true);
    this.auth.setAdminRoleSelected(true);
    this.router.navigate(['/usuario'], { replaceUrl: true });
  }
  goAsAdmin(){
    this.auth.setAdminActingAsUser(false);
    this.auth.setAdminRoleSelected(true);
    this.router.navigate(['/admin'], { replaceUrl: true });
  }
  backLogin(){
    this.auth.logout();
  }
}
