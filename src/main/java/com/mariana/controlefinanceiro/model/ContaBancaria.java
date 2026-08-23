package com.mariana.controlefinanceiro.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;

@Entity
public class ContaBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String accountId;

    @Column(nullable = false)
    private String itemId;

    @Column(nullable = false)
    private String nomeBanco;

    private String tipoConta;

    @Column(nullable = false)
    private double saldo;

    private String moeda;

    @ManyToOne
    @JoinColumn(
            name = "usuario_id",
            nullable = false
    )
    private Usuario usuario;

    public ContaBancaria(){
    }

    public Long getId(){
        return id;
    }
    public String getAccountId(){
        return accountId;
    }
    public void setAccountId(String accountId){
        this.accountId = accountId;
    }
    public String getItemId() {
        return itemId;
    }
    public void setItemId(String itemId){
        this.itemId = itemId;
    }
    public String getNomeBanco(){
        return nomeBanco;
    }
    public void setNomeBanco(String nomeBanco){
        this.nomeBanco = nomeBanco;
    }
    public String getTipoConta(){
        return tipoConta;
    }
    public void setTipoConta(String tipoConta){
        this.tipoConta = tipoConta;
    }
    public double getSaldo(){
        return saldo;
    }
    public void setSaldo(double saldo){
        this.saldo = saldo;
    }
    public String getMoeda(){
        return moeda;
    }
    public void setMoeda(String moeda){
        this.moeda = moeda;
    }
    public Usuario getUsuario(){
        return usuario;
    }
    public void setUsuario(Usuario usuario){
        this.usuario = usuario;
    }
}
