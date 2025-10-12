package com.utp_reporta_backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface TimeService {
    /**
     * Obtiene la fecha y hora actual para la zona horaria de "America/Lima"
     * consultando una fuente de tiempo externa (online).
     * @return LocalDateTime actual en "America/Lima".
     */
    LocalDateTime getCurrentLocalDateTimePeru();

    /**
     * Obtiene la fecha actual para la zona horaria de "America/Lima"
     * consultando una fuente de tiempo externa (online).
     * @return LocalDate actual en "America/Lima".
     */
    LocalDate getCurrentLocalDatePeru();
}
