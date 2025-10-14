package com.utp_reporta_backend.model;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.utp_reporta_backend.enums.TipoUsuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
//Entidad que representa a un usuario en el sistema e implementa UserDetails para integración con Spring Security.
public class Usuario implements UserDetails {
	//Identificador único del usuario.
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	//Nombre completo del usuario.
	private String nombreCompleto;
	//Nombre de usuario único para login.
	 @Column(nullable = false, unique = true)
	private String username;
	private String password;
	 @Column(nullable = false, unique = true)
	//Correo electrónico único del usuario.
	 private String correo;
	//Número de teléfono del usuario.
	private String telefono;
	//Tipo de usuario basado en el enum TipoUsuario.
	@Enumerated(EnumType.STRING) // Esto almacena el nombre del enum como String
	private TipoUsuario tipoUsuario; // ADMIN, PERSONAL_SEGURIDAD, USUARIO_COMUN
	@ManyToOne(fetch = FetchType.LAZY) // Muchas usuarios pueden pertenecer a una sede
	@JoinColumn(name = "sede_id") // Nombre de la columna en la tabla usuario que referencia a sede
	private Sede sede; // La sede a la que pertenece el usuario
	
	@ManyToMany(fetch = FetchType.LAZY)// Un usuario puede estar asociado a muchas zonas y viceversa	
	@JoinTable(
		// Nombre de la tabla intermedia para la relación muchos a muchos
	    name = "usuario_zona",
	    joinColumns = @JoinColumn(name = "usuario_id"),
	    inverseJoinColumns = @JoinColumn(name = "zona_id")
	)
	// Conjunto de zonas asociadas al usuario
	private Set<Zona> zonas = new HashSet<>();

	@Column(nullable = false)// El campo no puede ser nulo
	private boolean enabled = true;// Indica si el usuario está habilitado o no
	
	private LocalDate fechaUltimoReporte; // Fecha del último reporte enviado
    private int intentosReporte; // Contador de reportes diarios
    private int failedLoginAttempts = 0; 
    private LocalDateTime lockoutTime; 

	@ManyToMany(fetch = FetchType.EAGER)// Un usuario puede tener muchos roles y un rol puede ser asignado a muchos usuarios
	@JoinTable(name = "usuario_rol", joinColumns = @JoinColumn(name = "usuario_id"), inverseJoinColumns = @JoinColumn(name = "rol_id"))//Tabla intermedia para la relación muchos a muchos entre usuarios y roles.
	private Set<Rol> roles = new HashSet<>();//Roles asociados al usuario.

	@Override
	//Obtener las autoridades (roles) del usuario para Spring Security
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
		return roles.stream().map(role -> new SimpleGrantedAuthority(role.getNombre().name())) // Usa .name() para
																								// convertir el enum a
																								// String
				.collect(Collectors.toList());
	}
	//Cuenta no expirada
	@Override
    public boolean isAccountNonExpired() {
        return true;
    }
	//Cuenta no bloqueada
    @Override
    public boolean isAccountNonLocked() {
        return true; // La lógica de bloqueo se maneja en AuthServiceImpl usando TimeService.
    }
	//Credenciales no expiradas
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
	//Usuario habilitado
    @Override
    public boolean isEnabled() {
        return true;
    }
}
