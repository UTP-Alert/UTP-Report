package com.utp_reporta_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.utp_reporta_backend.model.Zona;
//Repositorio para manejar las operaciones CRUD de las zonas.
public interface ZonaRepository extends JpaRepository<Zona, Long>{

}
