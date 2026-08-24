package com.mariana.controlefinanceiro.repository;

import com.mariana.controlefinanceiro.model.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransacaoRepository
        extends JpaRepository<Transacao, Long> {

    List<Transacao> findByUsuarioId(
            Long usuarioId
    );

    boolean existsByIdentificadorExterno(
            String identificadorExterno
    );

    List<Transacao> findByUsuarioIdAndDataBetween(
            Long usuarioId,
            LocalDate inicio,
            LocalDate fim
    );

    Optional<Transacao> findByIdentificadorExterno(
            String identificadorExterno
    );

    List<Transacao> findByContaBancariaId(
            Long contaBancariaId
    );

}