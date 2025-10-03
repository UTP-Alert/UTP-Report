package com.utp_reporta_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.utp_reporta_backend.model.Sede;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Long>{

	boolean existsByNombre(String nombre);
	
	

}
