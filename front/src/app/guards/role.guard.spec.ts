import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ROLES } from '../constants/roles';

class MockRouter { navigate = jasmine.createSpy('navigate'); }

describe('roleGuard', () => {
  let auth: AuthService;
  let router: MockRouter;

  beforeEach(() => {
    auth = new AuthService({} as any, {} as any);
    (auth as any).rolesSignal.set([ROLES.ADMIN]);
    auth.isAuthenticated.set(true);
    router = new MockRouter();
    (auth as any).router = router; // hack para test rápido
  });

  it('permite acceso cuando rol coincide', () => {
  const can = roleGuard({ data: { roles: [ROLES.ADMIN] } } as any, {} as any);
    expect(can).toBeTrue();
  });
});
