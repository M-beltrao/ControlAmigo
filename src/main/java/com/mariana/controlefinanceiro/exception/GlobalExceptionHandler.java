package com.mariana.controlefinanceiro.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.mariana.controlefinanceiro.exception.CodigoVerificacaoException;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(LoginException.class)
    public ResponseEntity<String> tratarLoginException(LoginException exception) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(exception.getMessage());
    }

    @ExceptionHandler(CadastroException.class)
    public ResponseEntity<String> tratarCadastroException(
            CadastroException exception) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(exception.getMessage());
    }

    @ExceptionHandler(TransacaoNaoEncontradaException.class)
    public ResponseEntity<String> tratarTransacaoNaoEncontrada(
            TransacaoNaoEncontradaException exception) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(exception.getMessage());
    }

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<String> tratarUsuarioNaoEncontrado(
            UsuarioNaoEncontradoException exception) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(exception.getMessage());
    }
    @ExceptionHandler(CodigoVerificacaoException.class)
    public ResponseEntity<Map<String, String>> tratarCodigoVerificacao(
            CodigoVerificacaoException ex
    ) {
        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "mensagem",
                        ex.getMessage()
                ));
    }
}