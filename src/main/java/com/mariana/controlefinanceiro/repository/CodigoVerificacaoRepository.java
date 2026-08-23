package com.mariana.controlefinanceiro.repository;

import com.mariana.controlefinanceiro.model.CodigoVerificacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodigoVerificacaoRepository
        extends JpaRepository<CodigoVerificacao, Long> {

    Optional<CodigoVerificacao>
    findTopByUsuarioIdAndTipoAndUtilizadoFalseOrderByIdDesc(
            Long usuarioId,
            String tipo
    );
}