// Define un objeto `ROLES` que contiene las constantes de los roles de usuario en la aplicación.
// `as const` asegura que el objeto sea inmutable y que sus propiedades sean de tipo literal.
export const ROLES = {
  SUPERADMIN: 'ROLE_SUPERADMIN', // Rol para el superadministrador del sistema.
  ADMIN: 'ROLE_ADMIN',           // Rol para los administradores.
  USUARIO: 'ROLE_USUARIO',       // Rol para usuarios regulares.
  SEGURIDAD: 'ROLE_SEGURIDAD'    // Rol para personal de seguridad.
} as const;

// Define un tipo `RoleKey` que representa las claves del objeto `ROLES` (ej. 'SUPERADMIN', 'ADMIN').
export type RoleKey = keyof typeof ROLES;
// `ALL_ROLES` es un array que contiene todos los valores de los roles (ej. 'ROLE_SUPERADMIN', 'ROLE_ADMIN').
export const ALL_ROLES: string[] = Object.values(ROLES);
