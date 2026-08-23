package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.service.PluggyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pluggy")
public class PluggyController {

    private final PluggyService pluggyService;

    public PluggyController(
            PluggyService pluggyService
    ) {
        this.pluggyService = pluggyService;
    }

    @GetMapping("/teste")
    public Map<String, String> testarConexao() {

        pluggyService.gerarApiKey();

        return Map.of(
                "mensagem",
                "Conexão com a Pluggy realizada com sucesso."
        );
    }

    @GetMapping("/contas/{itemId}")
    public Map buscarContas(
            @PathVariable String itemId
    ) {
        return pluggyService.buscarContas(
                itemId
        );
    }

    @GetMapping("/transacoes/{accountId}")
    public List<Map<String, Object>> buscarTransacoes(
            @PathVariable String accountId
    ) {
        return pluggyService.buscarTransacoes(
                accountId
        );
    }

    @PostMapping("/sincronizar/{usuarioId}/{accountId}")
    public Map<String, Object> sincronizarTransacoes(
            @PathVariable Long usuarioId,
            @PathVariable String accountId
    ) {
        return pluggyService.sincronizarTransacoes(
                usuarioId,
                accountId
        );
    }

    @PostMapping("/contas/sincronizar/{usuarioId}/{itemId}")
    public Map<String, Object> sincronizarContas(
            @PathVariable Long usuarioId,
            @PathVariable String itemId
    ) {
        return pluggyService.sincronizarContas(
                usuarioId,
                itemId
        );
    }

    @PostMapping("/sincronizar/usuario/{usuarioId}")
    public Map<String, Object> sincronizarUsuario(
            @PathVariable Long usuarioId
    ) {
        return pluggyService.sincronizarUsuario(
                usuarioId
        );
    }
    @PostMapping("/connect-token/{usuarioId}")
    public Map<String, Object> gerarConnectToken(
            @PathVariable Long usuarioId
    ) {
        return pluggyService.gerarConnectToken(
                usuarioId
        );
    }
}