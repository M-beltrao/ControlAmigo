package com.mariana.controlefinanceiro.service;

import com.mariana.controlefinanceiro.exception.TransacaoNaoEncontradaException;
import com.mariana.controlefinanceiro.exception.UsuarioNaoEncontradoException;
import com.mariana.controlefinanceiro.model.Transacao;
import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.repository.TransacaoRepository;
import com.mariana.controlefinanceiro.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

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

    public Transacao salvarTransacao(Long usuarioId, Transacao transacao) {

        Usuario usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() ->
                        new UsuarioNaoEncontradoException("Usuário não encontrado")
                );

        transacao.setUsuario(usuario);

        return transacaoRepository.save(transacao);
    }

    public List<Transacao> listarPorUsuario(Long usuarioId) {
        return transacaoRepository.findByUsuarioId(usuarioId);
    }

    public Transacao atualizarTransacao(Long id, Transacao transacao) {

        Transacao transacaoExistente = transacaoRepository.findById(id)
                .orElseThrow(() ->
                        new TransacaoNaoEncontradaException("Transação não encontrada")
                );

        transacaoExistente.setValor(transacao.getValor());
        transacaoExistente.setDestinatario(transacao.getDestinatario());
        transacaoExistente.setDescricao(transacao.getDescricao());
        transacaoExistente.setCategoria(transacao.getCategoria());
        transacaoExistente.setData(transacao.getData());
        transacaoExistente.setTipo(transacao.getTipo());

        return transacaoRepository.save(transacaoExistente);
    }

    public void excluirTransacao(Long id) {

        if (!transacaoRepository.existsById(id)) {
            throw new TransacaoNaoEncontradaException("Transação não encontrada");
        }

        transacaoRepository.deleteById(id);
    }

    public Transacao buscarPorId(Long id) {

        return transacaoRepository.findById(id)
                .orElseThrow(() ->
                        new TransacaoNaoEncontradaException("Transação não encontrada")
                );
    }
}