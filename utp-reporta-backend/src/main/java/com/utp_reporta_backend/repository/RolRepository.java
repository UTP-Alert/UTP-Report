package com.utp_reporta_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.utp_reporta_backend.enums.ERol;
import com.utp_reporta_backend.model.Rol;
//Repositorio para manejar las operaciones CRUD de los roles.
@Repository
public interface RolRepository extends JpaRepository<Rol, Long>{//Buscar un rol por su nombre.
	Optional<Rol> findByNombre(ERol nombre);

}
