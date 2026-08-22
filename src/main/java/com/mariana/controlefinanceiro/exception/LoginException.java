package com.mariana.controlefinanceiro.exception;

public class LoginException extends RuntimeException {
    public LoginException(String mensagem){
        super(mensagem);
    }
}
