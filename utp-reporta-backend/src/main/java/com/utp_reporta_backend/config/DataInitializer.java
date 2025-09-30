package com.utp_reporta_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.utp_reporta_backend.enums.ERol;
import com.utp_reporta_backend.model.Rol;
import com.utp_reporta_backend.repository.RolRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner{

	private final RolRepository rolRepository;

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
	}

	
    
   
}
