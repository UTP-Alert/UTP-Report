package com.utp_reporta_backend.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class UsuarioRol {
	 @Id
	 @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;
}
