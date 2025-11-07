package com.utp_reporta_backend.service;

import com.utp_reporta_backend.enums.EstadoZona;
import com.utp_reporta_backend.model.Zona;
import com.utp_reporta_backend.repository.ZonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ZonaUpdateService {

    @Autowired
    private ZonaRepository zonaRepository;

    @Autowired
    private TimeService timeService;

    @Scheduled(cron = "0 0 0 * * ?") // Runs every day at midnight
    public void resetZoneStatus() {
        List<Zona> zonas = zonaRepository.findAll();
        for (Zona zona : zonas) {
            if (zona.getFirstReportDate() != null && timeService.getCurrentLocalDateTimePeru().isAfter(zona.getFirstReportDate().plusWeeks(1))) {
                zona.setReportCount(0);
                zona.setFirstReportDate(null);
                zona.setEstado(EstadoZona.ZONA_SEGURA);
                zonaRepository.save(zona);
            }
        }
    }
}
