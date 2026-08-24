package com.mariana.controlefinanceiro.service;

import com.mariana.controlefinanceiro.exception.UsuarioNaoEncontradoException;
import com.mariana.controlefinanceiro.model.ContaBancaria;
import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.repository.ContaBancariaRepository;
import com.mariana.controlefinanceiro.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContaBancariaService {

    private final ContaBancariaRepository contaBancariaRepository;
    private final UsuarioRepository usuarioRepository;

    public ContaBancariaService(
            ContaBancariaRepository contaBancariaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.contaBancariaRepository =
                contaBancariaRepository;

        this.usuarioRepository =
                usuarioRepository;
    }

    public ContaBancaria salvarOuAtualizar(
            Long usuarioId,
            ContaBancaria conta
    ) {

        Usuario usuario =
                usuarioRepository
                        .findById(usuarioId)
                        .orElseThrow(() ->
                                new UsuarioNaoEncontradoException(
                                        "Usuário não encontrado."
                                )
                        );

        ContaBancaria contaExistente =
                contaBancariaRepository
                        .findByAccountId(
                                conta.getAccountId()
                        )
                        .orElse(null);

        if (contaExistente != null) {

            contaExistente.setSaldo(
                    conta.getSaldo()
            );

            contaExistente.setNomeBanco(
                    conta.getNomeBanco()
            );

            contaExistente.setTipoConta(
                    conta.getTipoConta()
            );

            contaExistente.setMoeda(
                    conta.getMoeda()
            );

            contaExistente.setItemId(
                    conta.getItemId()
            );

            return contaBancariaRepository
                    .save(contaExistente);
        }

        conta.setUsuario(usuario);

        return contaBancariaRepository
                .save(conta);
    }

    public List<ContaBancaria> listarPorUsuario(
            Long usuarioId
    ) {

        return contaBancariaRepository
                .findByUsuarioId(
                        usuarioId
                );
    }

    public List<ContaBancaria> listarPorItemId(
            String itemId
    ) {

        return contaBancariaRepository
                .findByItemId(
                        itemId
                );
    }

    public double calcularSaldoTotal(
            Long usuarioId
    ) {

        List<ContaBancaria> contas =
                contaBancariaRepository
                        .findByUsuarioId(
                                usuarioId
                        );

        double saldoTotal = 0;

        for (ContaBancaria conta : contas) {

            saldoTotal +=
                    conta.getSaldo();
        }

        return saldoTotal;
    }

    @Transactional
    public void excluirPorItemId(
            String itemId
    ) {

        contaBancariaRepository
                .deleteByItemId(
                        itemId
                );
    }
}