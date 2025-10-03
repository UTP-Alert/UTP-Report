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
    this.router.navigate(['/usuario']);
  }
  goAsAdmin(){
    this.auth.setAdminActingAsUser(false);
    this.router.navigate(['/admin']);
  }
  backLogin(){
    this.auth.logout();
  }
}
