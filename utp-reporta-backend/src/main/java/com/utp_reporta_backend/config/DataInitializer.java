package com.utp_reporta_backend.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.utp_reporta_backend.enums.ERol;
import com.utp_reporta_backend.model.Rol;
import com.utp_reporta_backend.model.Sede;
import com.utp_reporta_backend.model.TipoIncidente;
import com.utp_reporta_backend.model.Usuario;
import com.utp_reporta_backend.model.Zona;
import com.utp_reporta_backend.repository.RolRepository;
import com.utp_reporta_backend.repository.SedeRepository;
import com.utp_reporta_backend.repository.TipoIncidenteRepository;
import com.utp_reporta_backend.repository.UsuarioRepository;
import com.utp_reporta_backend.repository.ZonaRepository;

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
    private final TipoIncidenteRepository tipoIncidenteRepository;
    private final SedeRepository sedeRepository;
    private final ZonaRepository zonaRepository;
    

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
		
		// Inicializar tipos de incidentes
        if (tipoIncidenteRepository.count() == 0) {
            TipoIncidente tipo1 = new TipoIncidente();
            tipo1.setNombre("Robo");
            tipoIncidenteRepository.save(tipo1);

            TipoIncidente tipo2 = new TipoIncidente();
            tipo2.setNombre("Intento de Robo");
            tipoIncidenteRepository.save(tipo2);

            TipoIncidente tipo3 = new TipoIncidente();
            tipo3.setNombre("Actividad Sospechosa");
            tipoIncidenteRepository.save(tipo3);
            
            TipoIncidente tipo4 = new TipoIncidente();
            tipo4.setNombre("Acoso o Intimidación");
            tipoIncidenteRepository.save(tipo4);
            
            TipoIncidente tipo5 = new TipoIncidente();
            tipo5.setNombre("Vandalismo");
            tipoIncidenteRepository.save(tipo5); 
            
            TipoIncidente tipo6 = new TipoIncidente();
            tipo6.setNombre("Emergencia Médica");
            tipoIncidenteRepository.save(tipo6);
        }

        // Inicializar sedes
        if (sedeRepository.count() == 0) {
            Sede sede1 = new Sede();
            sede1.setNombre("Lima Centro");
            sedeRepository.save(sede1);

            Sede sede2 = new Sede();
            sede2.setNombre("San Juan de Lurigancho");
            sedeRepository.save(sede2);

            Sede sede3 = new Sede();
            sede3.setNombre("Lima Norte");
            sedeRepository.save(sede3);
            
            Sede sede4 = new Sede();
            sede4.setNombre("Ate");
            sedeRepository.save(sede4);
            
            Sede sede5 = new Sede();
            sede5.setNombre("Lima Sur");
            sedeRepository.save(sede5);
        }

        // Inicializar zonas
        if (zonaRepository.count() == 0) {
            sedeRepository.findAll().forEach(sede -> {
                String sedeName = sede.getNombre();
                
                Zona zona1 = new Zona();
                zona1.setNombre("Pabellón A - " + sedeName);
                zona1.setActivo(true);
                zona1.setSede(sede);
                zonaRepository.save(zona1);

                Zona zona2 = new Zona();
                zona2.setNombre("Biblioteca - " + sedeName);
                zona2.setActivo(true);
                zona2.setSede(sede);
                zonaRepository.save(zona2);

                Zona zona3 = new Zona();
                zona3.setNombre("Cafetería - " + sedeName);
                zona3.setActivo(true);
                zona3.setSede(sede);
                zonaRepository.save(zona3);

                Zona zona4 = new Zona();
                zona4.setNombre("Estacionamiento - " + sedeName);
                zona4.setActivo(true);
                zona4.setSede(sede);
                zonaRepository.save(zona4);

                Zona zona5 = new Zona();
                zona5.setNombre("Laboratorio - " + sedeName);
                zona5.setActivo(true);
                zona5.setSede(sede);
                zonaRepository.save(zona5);
            });
        }
        // Nota: no forzamos el estado 'activo' para todas las zonas existentes al arranque
        // porque queremos respetar desactivaciones realizadas por usuarios.
	}

	
    
   
}
