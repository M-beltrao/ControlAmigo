package com.mariana.controlefinanceiro.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String gerarToken(Long usuarioId, String username) {
        return Jwts.builder()
                .subject(username)
                .claim("usuarioId", usuarioId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getChave())
                .compact();
    }

    public String extrairUsername(String token) {
        return extrairClaim(token, Claims::getSubject);
    }

    public Long extrairUsuarioId(String token) {
        Claims claims = extrairTodosClaims(token);
        return claims.get("usuarioId", Long.class);
    }

    public boolean tokenValido(String token, String username) {
        String usernameToken = extrairUsername(token);

        return usernameToken.equals(username)
                && !tokenExpirado(token);
    }

    private boolean tokenExpirado(String token) {
        return extrairExpiracao(token).before(new Date());
    }

    private Date extrairExpiracao(String token) {
        return extrairClaim(token, Claims::getExpiration);
    }

    private <T> T extrairClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {
        Claims claims = extrairTodosClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extrairTodosClaims(String token) {
        return Jwts.parser()
                .verifyWith(getChave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getChave() {
        byte[] chave = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(chave);
    }
}