package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.Transacao;
import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.service.TransacaoService;
import com.mariana.controlefinanceiro.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/transacoes")
public class TransacaoController {

    private final TransacaoService transacaoService;
    private final UsuarioService usuarioService;

    public TransacaoController(
            TransacaoService transacaoService,
            UsuarioService usuarioService
    ) {
        this.transacaoService = transacaoService;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Transacao> listarPorUsuario(
            @PathVariable Long usuarioId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        return transacaoService.listarPorUsuario(
                usuarioId
        );
    }

    @GetMapping("/usuario/{usuarioId}/periodo")
    public List<Transacao> listarPorPeriodo(
            @PathVariable Long usuarioId,
            @RequestParam int mes,
            @RequestParam int ano,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        return transacaoService.listarPorPeriodo(
                usuarioId,
                mes,
                ano
        );
    }

    @PostMapping("/usuario/{usuarioId}")
    public Transacao criar(
            @PathVariable Long usuarioId,
            @RequestBody Transacao transacao,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        return transacaoService.salvarTransacao(
                usuarioId,
                transacao
        );
    }

    @PutMapping("/{id}")
    public Transacao atualizar(
            @PathVariable Long id,
            @RequestBody Transacao transacao,
            Authentication authentication
    ) {

        validarAcessoATransacao(
                id,
                authentication
        );

        return transacaoService.atualizarTransacao(
                id,
                transacao
        );
    }

    @DeleteMapping("/{id}")
    public void excluir(
            @PathVariable Long id,
            Authentication authentication
    ) {

        validarAcessoATransacao(
                id,
                authentication
        );

        transacaoService.excluirTransacao(
                id
        );
    }

    @GetMapping("/{id}")
    public Transacao buscarPorId(
            @PathVariable Long id,
            Authentication authentication
    ) {

        Transacao transacao =
                transacaoService.buscarPorId(id);

        validarProprietarioDaTransacao(
                transacao,
                authentication
        );

        return transacao;
    }

    private void validarAcessoAoUsuario(
            Long usuarioId,
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

    private void validarAcessoATransacao(
            Long transacaoId,
            Authentication authentication
    ) {

        Transacao transacao =
                transacaoService.buscarPorId(
                        transacaoId
                );

        validarProprietarioDaTransacao(
                transacao,
                authentication
        );
    }

    private void validarProprietarioDaTransacao(
            Transacao transacao,
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso negado."
            );
        }

        if (transacao.getUsuario() == null ||
                !transacao.getUsuario()
                        .getUsername()
                        .equals(authentication.getName())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso negado."
            );
        }
    }
}