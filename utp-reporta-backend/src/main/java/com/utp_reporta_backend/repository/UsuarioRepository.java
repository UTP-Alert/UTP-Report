package com.utp_reporta_backend.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.utp_reporta_backend.model.Rol;
import com.utp_reporta_backend.model.Usuario;



@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
	Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByCorreo(String correo);
    Boolean existsByUsername(String username);
    Boolean existsByCorreo(String correo);
    Optional<Usuario> findByUsernameOrCorreo(String username, String correo);
    Optional<Usuario> findByRolesContains(Rol rol); 
}
