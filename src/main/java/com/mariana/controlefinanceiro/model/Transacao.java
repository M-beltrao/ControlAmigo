package com.mariana.controlefinanceiro.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Transacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double valor;

    @Column(nullable = false)
    private String destinatario;

    private String descricao;

    private String categoria;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private String tipo;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    public Transacao(){
    }

    public Transacao(double valor,
                     String destinatario,
                     String descricao,
                     String categoria,
                     LocalDate data,
                     String tipo,
                     Usuario usuario
    ){

        this.valor = valor;
        this.destinatario = destinatario;
        this.descricao = descricao;
        this.categoria = categoria;
        this.data = data;
        this.tipo = tipo;
        this.usuario = usuario;
    }
    public Long getId(){
        return id;
    }
    public double getValor(){
        return valor;
    }
    public void setValor(double valor){
        this.valor = valor;
    }
    public String getDestinatario(){
        return destinatario;
    }
    public void setDestinatario(String destinatario){
        this.destinatario = destinatario;
    }
    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Usuario getUsuario(){
        return usuario;
    }
    public void setUsuario(Usuario usuario){
        this.usuario = usuario;
    }
}



