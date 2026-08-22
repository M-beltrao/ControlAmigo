package com.mariana.controlefinanceiro.controller;

import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.service.UsuarioService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController

public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService){
        this.usuarioService = usuarioService;

    }
    @PostMapping("/usuarios")
    public Usuario salvarUsuario(@RequestBody Usuario usuario){
        return usuarioService.salvarUsuario(usuario);
    }
    @PostMapping("/login")
    public Usuario login(@RequestBody Usuario usuario){
        return usuarioService.login(
                usuario.getUsername(),
                usuario.getSenha()
        );
    }
}
