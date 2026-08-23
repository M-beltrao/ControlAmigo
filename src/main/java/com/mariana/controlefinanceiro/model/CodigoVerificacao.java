package com.mariana.controlefinanceiro.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class CodigoVerificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private String codigo;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String novoValor;

    @Column(nullable = false)
    private LocalDateTime expiracao;

    private boolean utilizado;

    protected CodigoVerificacao() {
    }

    public CodigoVerificacao(
            Long usuarioId,
            String codigo,
            String tipo,
            String novoValor,
            LocalDateTime expiracao
    ) {
        this.usuarioId = usuarioId;
        this.codigo = codigo;
        this.tipo = tipo;
        this.novoValor = novoValor;
        this.expiracao = expiracao;
        this.utilizado = false;
    }

    public Long getId() {
        return id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getTipo() {
        return tipo;
    }

    public String getNovoValor() {
        return novoValor;
    }

    public LocalDateTime getExpiracao() {
        return expiracao;
    }

    public boolean isUtilizado() {
        return utilizado;
    }

    public void setUtilizado(boolean utilizado) {
        this.utilizado = utilizado;
    }
}