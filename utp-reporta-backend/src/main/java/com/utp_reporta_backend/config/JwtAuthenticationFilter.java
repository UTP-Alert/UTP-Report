package com.utp_reporta_backend.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.utp_reporta_backend.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
//Filtro que valida el JWT en cada petición.

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter{
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
	@Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
        //Obtener el token del header
        String token = getJWTFromRequest(request);
        // Log diagnóstico mínimo para investigar 401 en DELETE
        try {
            logger.info("[JwtAuthFilter] {} {} Authorization-present={} tokenSample={}", request.getMethod(), request.getRequestURI(), (token!=null), (token!=null? token.substring(0, Math.min(10, token.length()))+"..." : "-"));
        } catch (Exception e) {
            logger.warn("[JwtAuthFilter] logging failed", e);
        }
        //Validar token y autenticar usuario
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            logger.info("[JwtAuthFilter] token validated OK for request {} {}", request.getMethod(), request.getRequestURI());
            String username = jwtTokenProvider.getUsernameFromJWT(token);
            
			UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
            UsernamePasswordAuthenticationToken authenticationToken = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }
        else {
            logger.info("[JwtAuthFilter] token missing or invalid for request {} {}", request.getMethod(), request.getRequestURI());
        }
        //Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
	}
    // Extraer el token JWT del encabezado Authorization
	private String getJWTFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

}
