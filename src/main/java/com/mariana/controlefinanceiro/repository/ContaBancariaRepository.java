package com.mariana.controlefinanceiro.repository;

import com.mariana.controlefinanceiro.model.ContaBancaria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContaBancariaRepository
        extends JpaRepository<ContaBancaria, Long> {

    Optional<ContaBancaria> findByAccountId(
            String accountId
    );

    List<ContaBancaria> findByUsuarioId(
            Long usuarioId
    );

    boolean existsByAccountId(
            String accountId
    );

    List<ContaBancaria> findByItemId(
            String itemId
    );

    void deleteByItemId(
            String itemId
    );
}