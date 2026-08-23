package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.Transacao;
import com.mariana.controlefinanceiro.service.TransacaoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transacoes")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(
            TransacaoService transacaoService
    ) {
        this.transacaoService =
                transacaoService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Transacao> listarPorUsuario(
            @PathVariable Long usuarioId
    ) {
        return transacaoService
                .listarPorUsuario(
                        usuarioId
                );
    }

    @GetMapping("/usuario/{usuarioId}/periodo")
    public List<Transacao> listarPorPeriodo(
            @PathVariable Long usuarioId,
            @RequestParam int mes,
            @RequestParam int ano
    ) {
        return transacaoService
                .listarPorPeriodo(
                        usuarioId,
                        mes,
                        ano
                );
    }

    @PostMapping("/usuario/{usuarioId}")
    public Transacao criar(
            @PathVariable Long usuarioId,
            @RequestBody Transacao transacao
    ) {
        return transacaoService
                .salvarTransacao(
                        usuarioId,
                        transacao
                );
    }

    @PutMapping("/{id}")
    public Transacao atualizar(
            @PathVariable Long id,
            @RequestBody Transacao transacao
    ) {
        return transacaoService
                .atualizarTransacao(
                        id,
                        transacao
                );
    }

    @DeleteMapping("/{id}")
    public void excluir(
            @PathVariable Long id
    ) {
        transacaoService
                .excluirTransacao(
                        id
                );
    }

    @GetMapping("/{id}")
    public Transacao buscarPorId(
            @PathVariable Long id
    ) {
        return transacaoService
                .buscarPorId(
                        id
                );
    }
}