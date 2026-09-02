package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.security.JwtService;
import com.mariana.controlefinanceiro.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    public UsuarioController(
            UsuarioService usuarioService,
            JwtService jwtService
    ) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    @GetMapping("/usuarios/{id}")
    public Usuario buscarUsuario(
            @PathVariable Long id,
            Authentication authentication
    ) {
        validarAcessoAoUsuario(id, authentication);

        return usuarioService.buscarUsuarioPorId(id);
    }

    @PostMapping("/usuarios")
    public Usuario salvarUsuario(
            @RequestBody Usuario usuario
    ) {
        return usuarioService.salvarUsuario(usuario);
    }

    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody Usuario usuario
    ) {

        Usuario usuarioAutenticado =
                usuarioService.login(
                        usuario.getUsername(),
                        usuario.getSenha()
                );

        String token =
                jwtService.gerarToken(
                        usuarioAutenticado.getId(),
                        usuarioAutenticado.getUsername()
                );

        Map<String, Object> resposta = new HashMap<>();

        resposta.put("token", token);
        resposta.put("id", usuarioAutenticado.getId());
        resposta.put("nome", usuarioAutenticado.getNome());
        resposta.put("username", usuarioAutenticado.getUsername());
        resposta.put("email", usuarioAutenticado.getEmail());
        resposta.put("telefone", usuarioAutenticado.getTelefone());
        resposta.put(
                "emailVerificado",
                usuarioAutenticado.isEmailVerificado()
        );
        resposta.put(
                "telefoneVerificado",
                usuarioAutenticado.isTelefoneVerificado()
        );

        return resposta;
    }

    @PostMapping("/usuarios/{id}/email/solicitar")
    public Map<String, String> solicitarAlteracaoEmail(
            @PathVariable Long id,
            @RequestBody Map<String, String> dados,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(id, authentication);

        String mensagem =
                usuarioService.solicitarAlteracaoEmail(
                        id,
                        dados.get("senhaAtual"),
                        dados.get("novoEmail")
                );

        return Map.of(
                "mensagem",
                mensagem
        );
    }

    @PutMapping("/usuarios/{id}/email/confirmar")
    public Usuario confirmarAlteracaoEmail(
            @PathVariable Long id,
            @RequestBody Map<String, String> dados,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(id, authentication);

        return usuarioService.confirmarAlteracaoEmail(
                id,
                dados.get("codigo")
        );
    }

    @PostMapping("/usuarios/{id}/telefone/solicitar")
    public Map<String, String> solicitarAlteracaoTelefone(
            @PathVariable Long id,
            @RequestBody Map<String, String> dados,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(id, authentication);

        usuarioService.solicitarAlteracaoTelefone(
                id,
                dados.get("senhaAtual"),
                dados.get("novoTelefone")
        );

        return Map.of(
                "mensagem",
                "Código de verificação gerado."
        );
    }

    @PutMapping("/usuarios/{id}/telefone/confirmar")
    public Usuario confirmarAlteracaoTelefone(
            @PathVariable Long id,
            @RequestBody Map<String, String> dados,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(id, authentication);

        return usuarioService.confirmarAlteracaoTelefone(
                id,
                dados.get("codigo")
        );
    }

    @PostMapping("/senha/recuperar")
    public Map<String, String> solicitarRecuperacaoSenha(
            @RequestBody Map<String, String> dados
    ) {

        String mensagem =
                usuarioService.solicitarRecuperacaoSenha(
                        dados.get("email")
                );

        return Map.of(
                "mensagem",
                mensagem
        );
    }

    @PutMapping("/senha/redefinir")
    public Map<String, String> redefinirSenha(
            @RequestBody Map<String, String> dados
    ) {

        String mensagem =
                usuarioService.redefinirSenha(
                        dados.get("email"),
                        dados.get("codigo"),
                        dados.get("novaSenha")
                );

        return Map.of(
                "mensagem",
                mensagem
        );
    }

    private void validarAcessoAoUsuario(
            Long id,
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso negado."
            );
        }

        Usuario usuario =
                usuarioService.buscarUsuarioPorId(id);

        if (!usuario.getUsername().equals(authentication.getName())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso negado."
            );
        }
    }
}