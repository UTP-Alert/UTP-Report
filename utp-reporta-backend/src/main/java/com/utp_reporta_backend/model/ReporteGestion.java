package com.utp_reporta_backend.model;

import com.utp_reporta_backend.enums.EstadoReporte;
import com.utp_reporta_backend.enums.PrioridadReporte;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteGestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Independent primary key for ReporteGestion

    @OneToOne
    @JoinColumn(name = "reporte_id", nullable = false, unique = true) // One-to-one relationship with Reporte
    private Reporte reporte;

    @Enumerated(EnumType.STRING)
    @Column(length = 30) // Increased length to accommodate longer enum names
    private EstadoReporte estado;

    @Enumerated(EnumType.STRING)
    private PrioridadReporte prioridad;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion; // Timestamp for when this gestion entry was created
}
