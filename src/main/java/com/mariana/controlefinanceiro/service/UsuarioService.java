package com.mariana.controlefinanceiro.service;

import com.mariana.controlefinanceiro.exception.CadastroException;
import com.mariana.controlefinanceiro.exception.LoginException;
import com.mariana.controlefinanceiro.exception.UsuarioNaoEncontradoException;
import com.mariana.controlefinanceiro.model.CodigoVerificacao;
import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final CodigoVerificacaoService codigoVerificacaoService;
    private final EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            CodigoVerificacaoService codigoVerificacaoService,
            EmailService emailService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.codigoVerificacaoService = codigoVerificacaoService;
        this.emailService = emailService;
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

        validarSenhaForte(usuario.getSenha());

        String senhaCriptografada =
                passwordEncoder.encode(usuario.getSenha());

        usuario.setSenha(senhaCriptografada);

        return usuarioRepository.save(usuario);
    }

    public Usuario login(
            String usernameOuEmail,
            String senha
    ) {

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

    public String solicitarAlteracaoEmail(
            Long id,
            String senhaAtual,
            String novoEmail
    ) {

        Usuario usuario = buscarUsuario(id);

        validarSenhaAtual(usuario, senhaAtual);

        if (usuarioRepository.existsByEmail(novoEmail)) {
            throw new CadastroException(
                    "Este e-mail já está cadastrado."
            );
        }

        String codigo =
                codigoVerificacaoService.gerarCodigo(
                        id,
                        "EMAIL",
                        novoEmail
                );

        emailService.enviarCodigoVerificacao(
                novoEmail,
                codigo
        );

        return "Código enviado para o novo e-mail.";
    }

    public Usuario confirmarAlteracaoEmail(
            Long id,
            String codigo
    ) {

        Usuario usuario = buscarUsuario(id);

        CodigoVerificacao verificacao =
                codigoVerificacaoService.validarCodigo(
                        id,
                        "EMAIL",
                        codigo
                );

        usuario.setEmail(
                verificacao.getNovoValor()
        );

        usuario.setEmailVerificado(true);

        return usuarioRepository.save(usuario);
    }

    public String solicitarAlteracaoTelefone(
            Long id,
            String senhaAtual,
            String novoTelefone
    ) {

        Usuario usuario = buscarUsuario(id);

        validarSenhaAtual(usuario, senhaAtual);

        if (usuarioRepository.existsByTelefone(novoTelefone)) {
            throw new CadastroException(
                    "Este telefone já está cadastrado."
            );
        }

        return codigoVerificacaoService.gerarCodigo(
                id,
                "TELEFONE",
                novoTelefone
        );
    }

    public Usuario confirmarAlteracaoTelefone(
            Long id,
            String codigo
    ) {

        Usuario usuario = buscarUsuario(id);

        CodigoVerificacao verificacao =
                codigoVerificacaoService.validarCodigo(
                        id,
                        "TELEFONE",
                        codigo
                );

        usuario.setTelefone(
                verificacao.getNovoValor()
        );

        usuario.setTelefoneVerificado(true);

        return usuarioRepository.save(usuario);
    }

    public String solicitarRecuperacaoSenha(
            String email
    ) {

        Usuario usuario =
                usuarioRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new UsuarioNaoEncontradoException(
                                        "Usuário não encontrado."
                                )
                        );

        String codigo =
                codigoVerificacaoService.gerarCodigo(
                        usuario.getId(),
                        "RECUPERACAO_SENHA",
                        email
                );

        emailService.enviarCodigoVerificacao(
                email,
                codigo
        );

        return "Código de recuperação enviado para o e-mail.";
    }

    public String redefinirSenha(
            String email,
            String codigo,
            String novaSenha
    ) {

        Usuario usuario =
                usuarioRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new UsuarioNaoEncontradoException(
                                        "Usuário não encontrado."
                                )
                        );

        validarSenhaForte(novaSenha);

        codigoVerificacaoService.validarCodigo(
                usuario.getId(),
                "RECUPERACAO_SENHA",
                codigo
        );

        String novaSenhaCriptografada =
                passwordEncoder.encode(novaSenha);

        usuario.setSenha(
                novaSenhaCriptografada
        );

        usuarioRepository.save(usuario);

        return "Senha redefinida com sucesso.";
    }

    private Usuario buscarUsuario(Long id) {

        return usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new UsuarioNaoEncontradoException(
                                "Usuário não encontrado."
                        )
                );
    }

    private void validarSenhaAtual(
            Usuario usuario,
            String senhaAtual
    ) {

        if (!passwordEncoder.matches(
                senhaAtual,
                usuario.getSenha()
        )) {
            throw new LoginException(
                    "Senha atual incorreta."
            );
        }
    }

    private void validarSenhaForte(String senha) {

        if (senha == null || senha.length() < 8) {
            throw new CadastroException(
                    "A senha deve ter pelo menos 8 caracteres."
            );
        }

        if (!senha.matches(".*[A-Z].*")) {
            throw new CadastroException(
                    "A senha deve conter pelo menos uma letra maiúscula."
            );
        }

        if (!senha.matches(".*[a-z].*")) {
            throw new CadastroException(
                    "A senha deve conter pelo menos uma letra minúscula."
            );
        }

        if (!senha.matches(".*\\d.*")) {
            throw new CadastroException(
                    "A senha deve conter pelo menos um número."
            );
        }
    }
    public Usuario buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new UsuarioNaoEncontradoException(
                                "Usuário não encontrado."
                        )
                );
    }
}