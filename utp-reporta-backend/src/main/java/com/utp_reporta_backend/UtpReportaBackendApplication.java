package com.utp_reporta_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

//Clase principal para iniciar la aplicación Spring Boot.
@SpringBootApplication
@EnableScheduling
public class UtpReportaBackendApplication {
	//Método principal para ejecutar la aplicación.
	public static void main(String[] args) {//Iniciar la aplicación Spring Boot.
		SpringApplication.run(UtpReportaBackendApplication.class, args);
	}

}
