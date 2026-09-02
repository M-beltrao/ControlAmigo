package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.service.ContaBancariaService;
import com.mariana.controlefinanceiro.service.PluggyService;
import com.mariana.controlefinanceiro.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pluggy")
public class PluggyController {

    private final PluggyService pluggyService;
    private final UsuarioService usuarioService;
    private final ContaBancariaService contaBancariaService;

    public PluggyController(
            PluggyService pluggyService,
            UsuarioService usuarioService,
            ContaBancariaService contaBancariaService
    ) {
        this.pluggyService = pluggyService;
        this.usuarioService = usuarioService;
        this.contaBancariaService = contaBancariaService;
    }

    @GetMapping("/teste")
    public Map<String, String> testarConexao(
            Authentication authentication
    ) {

        validarAutenticacao(authentication);

        pluggyService.gerarApiKey();

        return Map.of(
                "mensagem",
                "Conexão com a Pluggy realizada com sucesso."
        );
    }

    @GetMapping("/contas/{usuarioId}/{itemId}")
    public Map buscarContas(
            @PathVariable Long usuarioId,
            @PathVariable String itemId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        contaBancariaService.buscarPorItemIdDoUsuario(
                usuarioId,
                itemId
        );

        return pluggyService.buscarContas(
                itemId
        );
    }

    @GetMapping("/transacoes/{usuarioId}/{accountId}")
    public List<Map<String, Object>> buscarTransacoes(
            @PathVariable Long usuarioId,
            @PathVariable String accountId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        contaBancariaService.buscarPorAccountIdDoUsuario(
                usuarioId,
                accountId
        );

        return pluggyService.buscarTransacoes(
                accountId
        );
    }

    @PostMapping("/sincronizar/{usuarioId}/{accountId}")
    public Map<String, Object> sincronizarTransacoes(
            @PathVariable Long usuarioId,
            @PathVariable String accountId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        contaBancariaService.buscarPorAccountIdDoUsuario(
                usuarioId,
                accountId
        );

        return pluggyService.sincronizarTransacoes(
                usuarioId,
                accountId
        );
    }

    @PostMapping("/contas/sincronizar/{usuarioId}/{itemId}")
    public Map<String, Object> sincronizarContas(
            @PathVariable Long usuarioId,
            @PathVariable String itemId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        return pluggyService.sincronizarContas(
                usuarioId,
                itemId
        );
    }

    @PostMapping("/sincronizar/usuario/{usuarioId}")
    public Map<String, Object> sincronizarUsuario(
            @PathVariable Long usuarioId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        return pluggyService.sincronizarUsuario(
                usuarioId
        );
    }

    @PostMapping("/connect-token/{usuarioId}")
    public Map<String, Object> gerarConnectToken(
            @PathVariable Long usuarioId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        return pluggyService.gerarConnectToken(
                usuarioId
        );
    }

    @DeleteMapping("/desconectar/{usuarioId}/{itemId}")
    public Map<String, String> desconectarBanco(
            @PathVariable Long usuarioId,
            @PathVariable String itemId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        contaBancariaService.buscarPorItemIdDoUsuario(
                usuarioId,
                itemId
        );

        return pluggyService.desconectarBanco(
                usuarioId,
                itemId
        );
    }

    private void validarAcessoAoUsuario(
            Long usuarioId,
            Authentication authentication
    ) {

        validarAutenticacao(authentication);

        Usuario usuario =
                usuarioService.buscarUsuarioPorId(
                        usuarioId
                );

        if (!usuario.getUsername().equals(
                authentication.getName()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso negado."
            );
        }
    }

    private void validarAutenticacao(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso negado."
            );
        }
    }
}