package com.mariana.controlefinanceiro.repository;

import com.mariana.controlefinanceiro.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsernameOrEmail(
            String username,
            String email
    );

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByTelefone(String telefone);
}