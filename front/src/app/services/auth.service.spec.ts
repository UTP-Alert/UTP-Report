import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ROLES } from '../constants/roles';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  it('debe guardar token y roles en login', () => {
    service.login('user','pass').subscribe(res => {
      expect(service.getToken()).toBe('abc');
      expect(service.hasRole(ROLES.ADMIN)).toBeTrue();
    });
    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush({ token: 'abc', tipoToken: 'Bearer', roles: [ROLES.ADMIN] });
  });

  it('buildDisplayName para alumno', () => {
    (service as any).rolesSignal.set([ROLES.USUARIO]);
    const name = service.buildDisplayName('Juan Pérez','ALUMNO');
    expect(name.startsWith('Alum.')).toBeTrue();
  });
});
