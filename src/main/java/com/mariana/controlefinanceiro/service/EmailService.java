package com.mariana.controlefinanceiro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCodigoVerificacao(
            String destinatario,
            String codigo
    ) {

        SimpleMailMessage mensagem =
                new SimpleMailMessage();

        mensagem.setFrom(remetente);

        mensagem.setTo(destinatario);

        mensagem.setSubject(
                "Código de verificação - ControlAmigo"
        );

        mensagem.setText(
                "Seu código de verificação do ControlAmigo é: "
                        + codigo
                        + "\n\nEste código expira em 10 minutos."
                        + "\n\nSe você não solicitou esta alteração, ignore este e-mail."
        );

        mailSender.send(mensagem);
    }
}