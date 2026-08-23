package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.ContaBancaria;
import com.mariana.controlefinanceiro.service.ContaBancariaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contas-bancarias")
public class ContaBancariaController {

    private final ContaBancariaService contaBancariaService;

    public ContaBancariaController(
            ContaBancariaService contaBancariaService
    ) {
        this.contaBancariaService =
                contaBancariaService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<ContaBancaria> listarPorUsuario(
            @PathVariable Long usuarioId
    ) {
        return contaBancariaService
                .listarPorUsuario(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}/saldo")
    public Map<String, Object> buscarSaldoTotal(
            @PathVariable Long usuarioId
    ) {

        double saldoTotal =
                contaBancariaService
                        .calcularSaldoTotal(usuarioId);

        return Map.of(
                "saldo",
                saldoTotal
        );
    }
}