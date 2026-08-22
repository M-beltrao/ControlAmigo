package com.mariana.controlefinanceiro.service;

import com.mariana.controlefinanceiro.exception.CadastroException;
import com.mariana.controlefinanceiro.exception.LoginException;
import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario salvarUsuario(Usuario usuario) {

        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new CadastroException(
                    "Este e-mail já está cadastrado."
            );
        }

        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new CadastroException(
                    "Este username já está em uso."
            );
        }

        String senhaCriptografada =
                passwordEncoder.encode(usuario.getSenha());

        usuario.setSenha(senhaCriptografada);

        return usuarioRepository.save(usuario);
    }

    public Usuario login(String usernameOuEmail, String senha) {

        Optional<Usuario> usuarioEncontrado =
                usuarioRepository.findByUsernameOrEmail(
                        usernameOuEmail,
                        usernameOuEmail
                );

        if (usuarioEncontrado.isPresent()) {

            Usuario usuario = usuarioEncontrado.get();

            if (passwordEncoder.matches(
                    senha,
                    usuario.getSenha()
            )) {
                return usuario;
            }
        }

        throw new LoginException(
                "Usuário ou senha inválidos!"
        );
    }
}