export const ROLES = {
  SUPERADMIN: 'ROLE_SUPERADMIN',
  ADMIN: 'ROLE_ADMIN',
  USUARIO: 'ROLE_USUARIO',
  SEGURIDAD: 'ROLE_SEGURIDAD'
} as const;

export type RoleKey = keyof typeof ROLES;
export const ALL_ROLES: string[] = Object.values(ROLES);
