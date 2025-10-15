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

    @ManyToOne
    @JoinColumn(name = "reporte_id", nullable = false) // Many ReporteGestion entries can belong to one Reporte
    private Reporte reporte;

    @Enumerated(EnumType.STRING)
    private EstadoReporte estado;

    @Enumerated(EnumType.STRING)
    private PrioridadReporte prioridad;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now(); // Timestamp for when this gestion entry was created
}
