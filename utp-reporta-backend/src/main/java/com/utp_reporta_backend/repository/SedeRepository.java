package com.utp_reporta_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.utp_reporta_backend.model.Sede;
//Repositorio para manejar las operaciones CRUD de las sedes.
@Repository
public interface SedeRepository extends JpaRepository<Sede, Long>{//Verificar si una sede existe por su nombre.

	boolean existsByNombre(String nombre);
	
	Optional<Sede> findByNombre(String nombre);

}
