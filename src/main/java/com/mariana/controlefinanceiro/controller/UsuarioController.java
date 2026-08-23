package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }
    @GetMapping("/usuarios/{id}")
    public Usuario buscarUsuario(
            @PathVariable Long id
    ) {
        return usuarioService.buscarUsuarioPorId(id);
    }

    @PostMapping("/usuarios")
    public Usuario salvarUsuario(
            @RequestBody Usuario usuario
    ) {
        return usuarioService.salvarUsuario(usuario);
    }

    @PostMapping("/login")
    public Usuario login(
            @RequestBody Usuario usuario
    ) {
        return usuarioService.login(
                usuario.getUsername(),
                usuario.getSenha()
        );
    }

    @PostMapping("/usuarios/{id}/email/solicitar")
    public Map<String, String> solicitarAlteracaoEmail(
            @PathVariable Long id,
            @RequestBody Map<String, String> dados
    ) {

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
            @RequestBody Map<String, String> dados
    ) {
        return usuarioService.confirmarAlteracaoEmail(
                id,
                dados.get("codigo")
        );
    }

    @PostMapping("/usuarios/{id}/telefone/solicitar")
    public Map<String, String> solicitarAlteracaoTelefone(
            @PathVariable Long id,
            @RequestBody Map<String, String> dados
    ) {

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
            @RequestBody Map<String, String> dados
    ) {
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

        String mensagem = usuarioService.redefinirSenha(
                dados.get("email"),
                dados.get("codigo"),
                dados.get("novaSenha")
        );
        return Map.of("mensagem", mensagem);
    }
}