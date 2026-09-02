package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.ContaBancaria;
import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.service.ContaBancariaService;
import com.mariana.controlefinanceiro.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contas-bancarias")
public class ContaBancariaController {

    private final ContaBancariaService contaBancariaService;
    private final UsuarioService usuarioService;

    public ContaBancariaController(
            ContaBancariaService contaBancariaService,
            UsuarioService usuarioService
    ) {
        this.contaBancariaService = contaBancariaService;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<ContaBancaria> listarPorUsuario(
            @PathVariable Long usuarioId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        return contaBancariaService
                .listarPorUsuario(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}/saldo")
    public Map<String, Object> buscarSaldoTotal(
            @PathVariable Long usuarioId,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        double saldoTotal =
                contaBancariaService
                        .calcularSaldoTotal(usuarioId);

        return Map.of(
                "saldo",
                saldoTotal
        );
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
}