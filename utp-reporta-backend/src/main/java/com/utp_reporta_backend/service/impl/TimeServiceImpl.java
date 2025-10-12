package com.utp_reporta_backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.utp_reporta_backend.service.TimeService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class TimeServiceImpl implements TimeService {

    private static final String TIME_API_URL = "https://timeapi.io/api/time/current/zone?timeZone=America/Lima";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public TimeServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public LocalDateTime getCurrentLocalDateTimePeru() {
        try {
            String jsonResponse = restTemplate.getForObject(TIME_API_URL, String.class);
            JsonNode root = objectMapper.readTree(jsonResponse);
            String datetimeStr = root.path("dateTime").asText();
            // The datetime string from timeapi.io is like "2025-10-10T21:50:37.0913931"
            return LocalDateTime.parse(datetimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            System.err.println("Error fetching time from timeapi.io, falling back to local system time: " + e.getMessage());
            return LocalDateTime.now(); // Fallback
        }
    }

    @Override
    public LocalDate getCurrentLocalDatePeru() {
        return getCurrentLocalDateTimePeru().toLocalDate();
    }
}
