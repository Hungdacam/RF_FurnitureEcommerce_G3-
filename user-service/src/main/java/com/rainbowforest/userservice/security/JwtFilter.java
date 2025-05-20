package com.rainbowforest.userservice.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Autowired
    public JwtFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain) throws ServletException, IOException {

        final String requestURI = request.getRequestURI();
        logger.debug("Processing request: {} with context path: {}",
                requestURI, request.getContextPath());
        final String queryString = request.getQueryString();
        logger.debug("Processing request: {} with query: {}", requestURI, queryString);

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.debug("Extracted username from token: {}", username);
            } catch (Exception e) {
                logger.error("JWT token validation failed: {}", e.getMessage());
            }
        } else {
            // Kiểm tra token từ cookie
            if (request.getCookies() != null) {
                Optional<Cookie> tokenCookie = Arrays.stream(request.getCookies())
                        .filter(cookie -> "token".equals(cookie.getName()))
                        .findFirst();
                if (tokenCookie.isPresent()) {
                    jwt = tokenCookie.get().getValue();
                    try {
                        username = jwtUtil.extractUsername(jwt);
                        logger.debug("Extracted username from cookie token: {}", username);
                    } catch (Exception e) {
                        logger.error("JWT cookie token validation failed: {}", e.getMessage());
                    }
                }
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwt != null && jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication successful for user: {}", username);
                } else {
                    logger.warn("Token validation failed for user: {}", username);
                }
            } catch (Exception e) {
                logger.error("Error during authentication: {}", e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}
