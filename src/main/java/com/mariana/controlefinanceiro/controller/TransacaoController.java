package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.Transacao;
import com.mariana.controlefinanceiro.service.TransacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transacoes")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(
            TransacaoService transacaoService
    ) {
        this.transacaoService = transacaoService;
    }

    @PostMapping("/usuario/{usuarioId}")
    public Transacao criar(
            @PathVariable Long usuarioId,
            @RequestBody Transacao transacao
    ) {
        return transacaoService.salvarTransacao(usuarioId, transacao);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Transacao> listarPorUsuario(
            @PathVariable Long usuarioId
    ) {
        return transacaoService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{id}")
    public Transacao buscarPorId(
            @PathVariable Long id
    ) {
        return transacaoService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public Transacao atualizar(
            @PathVariable Long id,
            @RequestBody Transacao transacao
    ) {
        return transacaoService.atualizarTransacao(id, transacao);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> excluir(
            @PathVariable Long id
    ) {

        transacaoService.excluirTransacao(id);

        return ResponseEntity.ok("Transação excluída com sucesso!");
    }
}