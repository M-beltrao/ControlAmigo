package com.mariana.controlefinanceiro.service;

import com.mariana.controlefinanceiro.exception.CodigoVerificacaoException;
import com.mariana.controlefinanceiro.model.CodigoVerificacao;
import com.mariana.controlefinanceiro.repository.CodigoVerificacaoRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class CodigoVerificacaoService {

    private final CodigoVerificacaoRepository codigoRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    private final SecureRandom random =
            new SecureRandom();

    public CodigoVerificacaoService(
            CodigoVerificacaoRepository codigoRepository
    ) {
        this.codigoRepository = codigoRepository;
    }

    public String gerarCodigo(
            Long usuarioId,
            String tipo,
            String novoValor
    ) {

        int numero =
                100000 + random.nextInt(900000);

        String codigo =
                String.valueOf(numero);

        String codigoCriptografado =
                passwordEncoder.encode(codigo);

        CodigoVerificacao verificacao =
                new CodigoVerificacao(
                        usuarioId,
                        codigoCriptografado,
                        tipo,
                        novoValor,
                        LocalDateTime.now().plusMinutes(10)
                );

        codigoRepository.save(verificacao);

        return codigo;
    }

    public CodigoVerificacao validarCodigo(
            Long usuarioId,
            String tipo,
            String codigoDigitado
    ) {

        CodigoVerificacao verificacao =
                codigoRepository
                        .findTopByUsuarioIdAndTipoAndUtilizadoFalseOrderByIdDesc(
                                usuarioId,
                                tipo
                        )
                        .orElseThrow(() ->
                                new CodigoVerificacaoException(
                                        "Nenhum código de verificação encontrado."
                                )
                        );

        if (verificacao
                .getExpiracao()
                .isBefore(LocalDateTime.now())) {

            throw new CodigoVerificacaoException(
                    "Código expirado."
            );
        }

        if (!passwordEncoder.matches(
                codigoDigitado,
                verificacao.getCodigo()
        )) {

            throw new CodigoVerificacaoException(
                    "Código inválido."
            );
        }

        verificacao.setUtilizado(true);

        return codigoRepository.save(verificacao);
    }
}