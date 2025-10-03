package com.utp_reporta_backend.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.utp_reporta_backend.enums.ERol;
import com.utp_reporta_backend.model.Rol;
import com.utp_reporta_backend.model.Sede;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.repository.RolRepository;
import com.utp_reporta_backend.repository.SedeRepository;
import com.utp_reporta_backend.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner{

	private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final SedeRepository sedeRepository;
    

	@Override
	public void run(String... args) throws Exception {


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
		// 3. Verificar si no existen sedes, y si no, crear una sede predeterminada
        if (sedeRepository.count() == 0) {
            Sede sedeDefault = new Sede();
            sedeDefault.setNombre("Sede Ate");
            sedeRepository.save(sedeDefault);
        }
		
		// 2. Verificar si ya existe un usuario con el rol ROLE_SUPERADMIN
        if (usuarioRepository.count() == 0 || usuarioRepository.findByRolesContains(rolRepository.findByNombre(ERol.ROLE_SUPERADMIN).orElseThrow()) == null) {

            // Si no existe ningún usuario con ROLE_SUPERADMIN, creamos uno
            Usuario superAdmin = new Usuario();
            superAdmin.setNombreCompleto("Super Admin");
            superAdmin.setUsername("superadmin");
            superAdmin.setCorreo("superadmin@utp.edu.pe");
            superAdmin.setRoles(Set.of(rolRepository.findByNombre(ERol.ROLE_SUPERADMIN).orElseThrow()));
            superAdmin.setEnabled(true); // Habilitamos el usuario
            superAdmin.setIntentos(0); // Reiniciamos los intentos de login
            superAdmin.setSede(sedeRepository.findByNombre("Sede Ate"));

            // Encriptar la contraseña usando BCryptPasswordEncoder
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String encodedPassword = passwordEncoder.encode("admin"); // Encriptamos la contraseña
            superAdmin.setPassword(encodedPassword); // Asignamos la contraseña encriptada

            // Guardamos el usuario con la contraseña encriptada
            usuarioRepository.save(superAdmin);
        }
		
		
     
	}

	
    
   
}
