package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.service.RelatorioService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(
            RelatorioService relatorioService
    ) {
        this.relatorioService =
                relatorioService;
    }

    @GetMapping(
            value = "/usuario/{usuarioId}",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> gerarRelatorio(
            @PathVariable Long usuarioId,
            @RequestParam int mes,
            @RequestParam int ano
    ) {

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
}