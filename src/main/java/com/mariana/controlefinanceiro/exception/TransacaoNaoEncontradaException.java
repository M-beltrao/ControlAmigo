package com.mariana.controlefinanceiro.exception;

public class TransacaoNaoEncontradaException extends RuntimeException {

    public TransacaoNaoEncontradaException(String mensagem){
        super(mensagem);
    }
}
