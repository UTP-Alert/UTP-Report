package com.utp_reporta_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tipo_incidente_id", nullable = false)
    private TipoIncidente tipoIncidente;

    @ManyToOne
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @Column(nullable = false)
    private String descripcion;

    @Lob
    @Column(length = 1000000)
    private byte[] foto;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private Boolean isAnonimo;

    private String contacto;

    @OneToOne(mappedBy = "reporte", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ReporteGestion reporteGestion;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "seguridad_asignado_id")
    private Usuario seguridadAsignado;

    private String mensajeSeguridad;
    private String mensajeAdmin;
}
