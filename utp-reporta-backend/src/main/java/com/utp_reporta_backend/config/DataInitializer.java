package com.utp_reporta_backend.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.utp_reporta_backend.enums.ERol;
import com.utp_reporta_backend.model.Rol;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.repository.RolRepository;
import com.utp_reporta_backend.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
 /**
 * Clase: DataInitializer
 * Esta clase sirve para inicializar datos básicos en la base de datos cuando el sistema arranca por primera vez.
 * Crea los roles principales (SUPERADMIN, ADMIN, USUARIO, SEGURIDAD) si no existen.
 * Crea un usuario por defecto con rol SUPERADMIN para poder entrar al sistema.
 * Se ejecuta automáticamente porque implementa la interfaz CommandLineRunner.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner{

	private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    

	@Override
	public void run(String... args) throws Exception {
 /**
 * Crear los roles por defecto
 * Verificamos si la tabla de roles está vacía (count == 0).
 * Si es así, insertamos los roles necesarios para el sistema.
 */

		if (rolRepository.count() == 0) {
            Rol rolSuperAdmin = new Rol();
            rolSuperAdmin.setNombre(ERol.ROLE_SUPERADMIN);
            rolRepository.save(rolSuperAdmin);
            
            Rol rolAdmin = new Rol();
            rolAdmin.setNombre(ERol.ROLE_ADMIN);
            rolRepository.save(rolAdmin);
            
            Rol rolUsuario = new Rol();
            rolUsuario.setNombre(ERol.ROLE_USUARIO);
            rolRepository.save(rolUsuario);
            
            Rol rolSeguridad = new Rol();
            rolSeguridad.setNombre(ERol.ROLE_SEGURIDAD);
            rolRepository.save(rolSeguridad);
        }
		
		
		// Verificar si ya existe un usuario con el rol ROLE_SUPERADMIN
        if (usuarioRepository.count() == 0) {

            // Si no existe ningún usuario con ROLE_SUPERADMIN, creamos uno
            Usuario superAdmin = new Usuario();
            superAdmin.setNombreCompleto("Super Admin");
            superAdmin.setUsername("superadmin");
            superAdmin.setCorreo("superadmin@utp.edu.pe");
            superAdmin.setRoles(Set.of(rolRepository.findByNombre(ERol.ROLE_SUPERADMIN).orElseThrow()));
            superAdmin.setEnabled(true); // Habilitamos el usuario
            superAdmin.setIntentosReporte(0); // Reiniciamos los intentos de login

            // Encriptar la contraseña usando BCryptPasswordEncoder
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String encodedPassword = passwordEncoder.encode("admin"); // Encriptamos la contraseña
            superAdmin.setPassword(encodedPassword); // Asignamos la contraseña encriptada

            // Guardamos el usuario con la contraseña encriptada
            usuarioRepository.save(superAdmin);
        }
		
		
     
	}

	
    
   
}
