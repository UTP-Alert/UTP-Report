package com.utp_reporta_backend.controller;

import com.utp_reporta_backend.service.TimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/time")
public class TimeController {

    @Autowired
    private TimeService timeService;

    @GetMapping("/peru-date")
    public ResponseEntity<LocalDate> getPeruDate() {
        return ResponseEntity.ok(timeService.getCurrentLocalDatePeru());
    }

    @GetMapping("/peru-datetime")
    public ResponseEntity<LocalDateTime> getPeruDateTime() {
        return ResponseEntity.ok(timeService.getCurrentLocalDateTimePeru());
    }
}
