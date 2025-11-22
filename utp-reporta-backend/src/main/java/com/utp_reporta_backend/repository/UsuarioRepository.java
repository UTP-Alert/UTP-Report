package com.utp_reporta_backend.repository;


import java.util.Optional;

import com.utp_reporta_backend.enums.ERol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.utp_reporta_backend.model.Usuario;

import java.util.List;


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

    List<Usuario> findByRoles_NombreAndZonas_IdAndSede_Id(ERol role, Long zonaId, Long sedeId);
    List<Usuario> findByRoles_NombreAndZonas_Id(ERol role, Long zonaId);
    List<Usuario> findByRoles_NombreAndSede_Id(ERol role, Long sedeId);
    List<Usuario> findByRoles_Nombre(ERol role);
    List<Usuario> findByEnabled(boolean enabled);
    List<Usuario> findByRoles_NombreNot(ERol role);

    // Verificar si un usuario existe por su número de teléfono.
    Boolean existsByTelefono(String telefono);

    // Verificar si un número de teléfono existe para otro usuario (excluyendo el id actual).
    Boolean existsByTelefonoAndIdNot(String telefono, Long id);
}
