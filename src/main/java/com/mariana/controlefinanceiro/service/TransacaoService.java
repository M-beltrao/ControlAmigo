package com.mariana.controlefinanceiro.service;

import com.mariana.controlefinanceiro.exception.TransacaoNaoEncontradaException;
import com.mariana.controlefinanceiro.exception.UsuarioNaoEncontradoException;
import com.mariana.controlefinanceiro.model.Transacao;
import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.repository.TransacaoRepository;
import com.mariana.controlefinanceiro.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import com.mariana.controlefinanceiro.model.ContaBancaria;
import java.time.LocalDate;

import java.util.List;

@Service
public class TransacaoService {

    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public TransacaoService(
            TransacaoRepository transacaoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.transacaoRepository = transacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Transacao salvarTransacao(
            Long usuarioId,
            Transacao transacao
    ) {

        Usuario usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() ->
                        new UsuarioNaoEncontradoException(
                                "Usuário não encontrado"
                        )
                );

        transacao.setUsuario(usuario);

        transacao.setOrigem("MANUAL");

        transacao.setIdentificadorExterno(null);

        return transacaoRepository.save(transacao);
    }

    public Transacao salvarTransacaoBancaria(
            Long usuarioId,
            ContaBancaria contaBancaria,
            Transacao transacao
    ) {

        Usuario usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() ->
                        new UsuarioNaoEncontradoException(
                                "Usuário não encontrado"
                        )
                );

        if (
                transacao.getIdentificadorExterno() == null ||
                        transacao.getIdentificadorExterno().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "A transação bancária precisa possuir um identificador externo."
            );
        }

        boolean jaExiste =
                transacaoRepository
                        .existsByIdentificadorExterno(
                                transacao.getIdentificadorExterno()
                        );

        if (jaExiste) {
            throw new IllegalArgumentException(
                    "Esta transação bancária já foi cadastrada."
            );
        }

        transacao.setUsuario(usuario);

        transacao.setContaBancaria(contaBancaria);

        transacao.setOrigem(
                "BANCO"
        );

        return transacaoRepository.save(
                transacao
        );
    }

    public boolean existePorIdentificadorExterno(
            String identificadorExterno
    ) {

        return transacaoRepository
                .existsByIdentificadorExterno(
                        identificadorExterno
                );
    }

    public List<Transacao> listarPorUsuario(
            Long usuarioId
    ) {
        return transacaoRepository
                .findByUsuarioId(usuarioId);
    }

    public Transacao atualizarTransacao(
            Long id,
            Transacao transacao
    ) {

        Transacao transacaoExistente =
                transacaoRepository.findById(id)
                        .orElseThrow(() ->
                                new TransacaoNaoEncontradaException(
                                        "Transação não encontrada"
                                )
                        );

        transacaoExistente.setValor(
                transacao.getValor()
        );

        transacaoExistente.setDestinatario(
                transacao.getDestinatario()
        );

        transacaoExistente.setDescricao(
                transacao.getDescricao()
        );

        transacaoExistente.setCategoria(
                transacao.getCategoria()
        );

        transacaoExistente.setData(
                transacao.getData()
        );

        transacaoExistente.setTipo(
                transacao.getTipo()
        );

        return transacaoRepository.save(
                transacaoExistente
        );
    }

    public void excluirTransacao(Long id) {

        if (!transacaoRepository.existsById(id)) {
            throw new TransacaoNaoEncontradaException(
                    "Transação não encontrada"
            );
        }

        transacaoRepository.deleteById(id);
    }

    public Transacao buscarPorId(Long id) {

        return transacaoRepository.findById(id)
                .orElseThrow(() ->
                        new TransacaoNaoEncontradaException(
                                "Transação não encontrada"
                        )
                );
    }
    public List<Transacao> listarPorPeriodo(
            Long usuarioId,
            int mes,
            int ano
    ) {

        LocalDate inicio =
                LocalDate.of(
                        ano,
                        mes,
                        1
                );

        LocalDate fim =
                inicio.withDayOfMonth(
                        inicio.lengthOfMonth()
                );

        return transacaoRepository
                .findByUsuarioIdAndDataBetween(
                        usuarioId,
                        inicio,
                        fim
                );
    }
    public Transacao vincularContaBancaria(
            String identificadorExterno,
            ContaBancaria contaBancaria
    ) {

        Transacao transacao =
                transacaoRepository
                        .findByIdentificadorExterno(
                                identificadorExterno
                        )
                        .orElseThrow(() ->
                                new TransacaoNaoEncontradaException(
                                        "Transação bancária não encontrada."
                                )
                        );

        transacao.setContaBancaria(
                contaBancaria
        );

        return transacaoRepository.save(
                transacao
        );
    }
    public void desvincularContaBancaria(
            ContaBancaria contaBancaria
    ) {

        List<Transacao> transacoes =
                transacaoRepository
                        .findByContaBancariaId(
                                contaBancaria.getId()
                        );

        for (Transacao transacao : transacoes) {

            transacao.setContaBancaria(
                    null
            );
        }

        transacaoRepository.saveAll(
                transacoes
        );
    }
}