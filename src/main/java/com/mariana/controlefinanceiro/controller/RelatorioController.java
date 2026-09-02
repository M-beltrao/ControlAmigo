package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.service.RelatorioService;
import com.mariana.controlefinanceiro.service.UsuarioService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;
    private final UsuarioService usuarioService;

    public RelatorioController(
            RelatorioService relatorioService,
            UsuarioService usuarioService
    ) {
        this.relatorioService = relatorioService;
        this.usuarioService = usuarioService;
    }

    @GetMapping(
            value = "/usuario/{usuarioId}",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> gerarRelatorio(
            @PathVariable Long usuarioId,
            @RequestParam int mes,
            @RequestParam int ano,
            Authentication authentication
    ) {

        validarAcessoAoUsuario(
                usuarioId,
                authentication
        );

        byte[] pdf =
                relatorioService
                        .gerarRelatorioMensal(
                                usuarioId,
                                mes,
                                ano
                        );

        String nomeArquivo =
                String.format(
                        "relatorio_controlamigo_%02d_%d.pdf",
                        mes,
                        ano
                );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_PDF
        );

        headers.set(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" +
                        nomeArquivo +
                        "\""
        );

        return new ResponseEntity<>(
                pdf,
                headers,
                HttpStatus.OK
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