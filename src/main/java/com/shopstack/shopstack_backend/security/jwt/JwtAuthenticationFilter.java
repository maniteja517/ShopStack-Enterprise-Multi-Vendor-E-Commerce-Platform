package com.shopstack.shopstack_backend.security.jwt;

import com.shopstack.shopstack_backend.security.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final com.shopstack.shopstack_backend.security.jwt.JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthenticationFilter(
            com.shopstack.shopstack_backend.security.jwt.JwtService jwtService,
            CustomUserDetailsService customUserDetailsService) {

        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
    }

    // ============================================
    // SKIP JWT FILTER FOR LOGIN AND REGISTER
    // ============================================

    @Override
    protected boolean shouldNotFilter(
            @NonNull HttpServletRequest request) {

        String path = request.getServletPath();

        return path.startsWith("/api/auth/");
    }

    // ============================================
    // JWT FILTER
    // ============================================

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("======================================");
        System.out.println("JWT FILTER EXECUTED");
        System.out.println("Request URI    : "
                + request.getRequestURI());
        System.out.println("Request Method : "
                + request.getMethod());

        final String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "Authorization Header : "
                        + authHeader
        );

        // ============================================
        // NO TOKEN
        // ============================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "No Bearer Token Found -> Continuing Request"
            );

            filterChain.doFilter(request, response);

            return;
        }

        // ============================================
        // EXTRACT TOKEN
        // ============================================

        final String jwt =
                authHeader.substring(7);

        System.out.println("JWT Token : " + jwt);

        try {

            final String email =
                    jwtService.extractUsername(jwt);

            System.out.println(
                    "Email Extracted : " + email
            );

            if (email != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        customUserDetailsService
                                .loadUserByUsername(email);

                System.out.println(
                        "User Loaded : "
                                + userDetails.getUsername()
                );

                System.out.println(
                        "Authorities : "
                                + userDetails.getAuthorities()
                );

                if (jwtService.isTokenValid(
                        jwt,
                        userDetails)) {

                    System.out.println("JWT VALID");

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);

                    System.out.println(
                            "Authentication Set Successfully"
                    );

                } else {

                    System.out.println("JWT INVALID");
                }
            }

        } catch (Exception exception) {

            System.out.println(
                    "JWT ERROR: "
                            + exception.getMessage()
            );

            // Don't authenticate the request
            // if the JWT is invalid.
            SecurityContextHolder
                    .clearContext();
        }

        filterChain.doFilter(request, response);

        System.out.println("JWT FILTER COMPLETED");
        System.out.println("======================================");
    }
}