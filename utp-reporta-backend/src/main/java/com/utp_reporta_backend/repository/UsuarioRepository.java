package com.utp_reporta_backend.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.utp_reporta_backend.model.Usuario;


//Repositorio para manejar las operaciones CRUD de los usuarios.
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
    //Buscar un usuario por su nombre de usuario.
	Optional<Usuario> findByUsername(String username); 
    //Buscar un usuario por su correo electrónico.
    Optional<Usuario> findByCorreo(String correo);  
    //Verificar si un usuario existe por su nombre de usuario.
    Boolean existsByUsername(String username);  
    //Verificar si un usuario existe por su correo electrónico.
    Boolean existsByCorreo(String correo); 
    //Verificar si un usuario existe por su nombre de usuario.
    Optional<Usuario> findByUsernameOrCorreo(String username, String correo); 
    //Buscar un usuario por su nombre de usuario o correo electrónico.
}
