package com.mariana.controlefinanceiro.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String nome;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(unique = true)
    private String telefone;
    private boolean telefoneVerificado;
    private boolean emailVerificado;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String senha;

    protected Usuario(){
    }

    public Usuario(String nome, String username, String email, String senha){

        this.nome = nome;
        this.username = username;
        this.email = email;
        this.senha = senha;
        this.telefoneVerificado = false;
        this.emailVerificado = false;
    }

    public String getNome() {
        return nome;

    }

    public void setNome(String nome){
        this.nome = nome;
    }
    public String getUsername(){
        return username;
    }
    public void setUsername(String username){
        this.username = username;
    }
    public String getEmail(){
        return email;
    }
    public void setEmail(String email){
        this.email = email;
    }
    public String getSenha(){
        return senha;
    }
    public void setSenha(String senha){
        this.senha = senha;
    }
    public Long getId(){
        return id;
    }
    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public boolean isTelefoneVerificado() {
        return telefoneVerificado;
    }

    public void setTelefoneVerificado(boolean telefoneVerificado) {
        this.telefoneVerificado = telefoneVerificado;
    }

    public boolean isEmailVerificado() {
        return emailVerificado;
    }

    public void setEmailVerificado(boolean emailVerificado) {
        this.emailVerificado = emailVerificado;
    }
}
