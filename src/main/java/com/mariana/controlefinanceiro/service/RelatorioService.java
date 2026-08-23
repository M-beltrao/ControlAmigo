package com.mariana.controlefinanceiro.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.mariana.controlefinanceiro.model.Transacao;
import com.mariana.controlefinanceiro.model.Usuario;
import com.mariana.controlefinanceiro.repository.TransacaoRepository;
import com.mariana.controlefinanceiro.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RelatorioService {

    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public RelatorioService(
            TransacaoRepository transacaoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.transacaoRepository =
                transacaoRepository;

        this.usuarioRepository =
                usuarioRepository;
    }

    public byte[] gerarRelatorioMensal(
            Long usuarioId,
            int mes,
            int ano
    ) {

        Usuario usuario =
                usuarioRepository
                        .findById(usuarioId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Usuário não encontrado."
                                )
                        );

        LocalDate inicio =
                LocalDate.of(
                        ano,
                        mes,
                        1
                );

        LocalDate fim =
                inicio.withDayOfMonth(
                        inicio.lengthOfMonth()
                );

        List<Transacao> transacoes =
                transacaoRepository
                        .findByUsuarioIdAndDataBetween(
                                usuarioId,
                                inicio,
                                fim
                        );

        double receitas = 0;
        double despesas = 0;

        for (Transacao transacao : transacoes) {

            if (
                    "RECEITA".equalsIgnoreCase(
                            transacao.getTipo()
                    )
            ) {
                receitas +=
                        transacao.getValor();
            }

            if (
                    "DESPESA".equalsIgnoreCase(
                            transacao.getTipo()
                    )
            ) {
                despesas +=
                        transacao.getValor();
            }
        }

        double saldo =
                receitas - despesas;

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document =
                new Document(
                        PageSize.A4,
                        35,
                        35,
                        35,
                        35
                );

        Color azulEscuro =
                new Color(
                        23,
                        55,
                        94
                );

        Color verde =
                new Color(
                        50,
                        204,
                        131
                );

        Color vermelho =
                new Color(
                        231,
                        93,
                        93
                );

        Color azulClaro =
                new Color(
                        238,
                        247,
                        251
                );

        Color cinzaClaro =
                new Color(
                        247,
                        249,
                        251
                );

        Color cinzaTexto =
                new Color(
                        128,
                        144,
                        165
                );

        try {

            PdfWriter writer =
                    PdfWriter.getInstance(
                            document,
                            outputStream
                    );

            document.open();

            PdfPTable cabecalho =
                    new PdfPTable(1);

            cabecalho.setWidthPercentage(
                    100
            );

            PdfPCell celulaCabecalho =
                    new PdfPCell();

            celulaCabecalho.setBackgroundColor(
                    azulEscuro
            );

            celulaCabecalho.setPadding(
                    18
            );

            celulaCabecalho.setBorder(
                    Rectangle.NO_BORDER
            );

            Paragraph logo =
                    new Paragraph();

            Font fonteControl =
                    new Font(
                            Font.HELVETICA,
                            22,
                            Font.BOLD,
                            Color.WHITE
                    );

            Font fonteAmigo =
                    new Font(
                            Font.HELVETICA,
                            22,
                            Font.BOLD,
                            verde
                    );

            logo.add(
                    new Chunk(
                            "Control",
                            fonteControl
                    )
            );

            logo.add(
                    new Chunk(
                            "Amigo",
                            fonteAmigo
                    )
            );

            celulaCabecalho.addElement(
                    logo
            );

            Paragraph subtituloCabecalho =
                    new Paragraph(
                            "Seu parceiro para uma vida financeira organizada",
                            new Font(
                                    Font.HELVETICA,
                                    9,
                                    Font.NORMAL,
                                    Color.WHITE
                            )
                    );

            subtituloCabecalho.setSpacingBefore(
                    4
            );

            celulaCabecalho.addElement(
                    subtituloCabecalho
            );

            cabecalho.addCell(
                    celulaCabecalho
            );

            document.add(
                    cabecalho
            );

            document.add(
                    new Paragraph(" ")
            );

            Font fonteTitulo =
                    new Font(
                            Font.HELVETICA,
                            20,
                            Font.BOLD,
                            azulEscuro
                    );

            Paragraph titulo =
                    new Paragraph(
                            "Relatório Financeiro",
                            fonteTitulo
                    );

            document.add(
                    titulo
            );

            Font fonteInformacao =
                    new Font(
                            Font.HELVETICA,
                            10,
                            Font.NORMAL,
                            cinzaTexto
                    );

            Paragraph usuarioTexto =
                    new Paragraph(
                            "Usuário: " +
                                    usuario.getNome(),
                            fonteInformacao
                    );

            usuarioTexto.setSpacingBefore(
                    5
            );

            document.add(
                    usuarioTexto
            );

            Paragraph periodo =
                    new Paragraph(
                            "Período: " +
                                    nomeMes(mes) +
                                    " de " +
                                    ano,
                            fonteInformacao
                    );

            periodo.setSpacingBefore(
                    2
            );

            document.add(
                    periodo
            );

            document.add(
                    new Paragraph(" ")
            );

            PdfPTable resumo =
                    new PdfPTable(3);

            resumo.setWidthPercentage(
                    100
            );

            resumo.setSpacingBefore(
                    8
            );

            resumo.setSpacingAfter(
                    20
            );

            adicionarCardResumo(
                    resumo,
                    "Receitas",
                    formatarMoeda(receitas),
                    verde,
                    azulClaro
            );

            adicionarCardResumo(
                    resumo,
                    "Despesas",
                    formatarMoeda(despesas),
                    vermelho,
                    new Color(
                            255,
                            240,
                            240
                    )
            );

            adicionarCardResumo(
                    resumo,
                    "Saldo do período",
                    formatarMoeda(saldo),
                    saldo >= 0
                            ? azulEscuro
                            : vermelho,
                    cinzaClaro
            );

            document.add(
                    resumo
            );

            Paragraph tituloTransacoes =
                    new Paragraph(
                            "Transações do período",
                            new Font(
                                    Font.HELVETICA,
                                    14,
                                    Font.BOLD,
                                    azulEscuro
                            )
                    );

            tituloTransacoes.setSpacingAfter(
                    10
            );

            document.add(
                    tituloTransacoes
            );

            if (transacoes.isEmpty()) {

                Paragraph vazio =
                        new Paragraph(
                                "Nenhuma transação encontrada para este período.",
                                fonteInformacao
                        );

                document.add(
                        vazio
                );

            } else {

                PdfPTable tabela =
                        new PdfPTable(
                                new float[]{
                                        1.2f,
                                        2.2f,
                                        1.8f,
                                        1.3f,
                                        1.5f
                                }
                        );

                tabela.setWidthPercentage(
                        100
                );

                tabela.setHeaderRows(
                        1
                );

                adicionarCabecalhoTabela(
                        tabela,
                        "Data",
                        azulEscuro
                );

                adicionarCabecalhoTabela(
                        tabela,
                        "Descrição",
                        azulEscuro
                );

                adicionarCabecalhoTabela(
                        tabela,
                        "Categoria",
                        azulEscuro
                );

                adicionarCabecalhoTabela(
                        tabela,
                        "Tipo",
                        azulEscuro
                );

                adicionarCabecalhoTabela(
                        tabela,
                        "Valor",
                        azulEscuro
                );

                DateTimeFormatter formatter =
                        DateTimeFormatter.ofPattern(
                                "dd/MM/yyyy"
                        );

                boolean linhaAlternada =
                        false;

                for (
                        Transacao transacao :
                        transacoes
                ) {

                    Color fundo =
                            linhaAlternada
                                    ? cinzaClaro
                                    : Color.WHITE;

                    adicionarCelulaTabela(
                            tabela,
                            transacao.getData() != null
                                    ? transacao
                                    .getData()
                                    .format(formatter)
                                    : "-",
                            fundo,
                            azulEscuro
                    );

                    String descricao =
                            transacao.getDestinatario();

                    if (
                            descricao == null ||
                                    descricao.isBlank()
                    ) {
                        descricao =
                                transacao.getDescricao();
                    }

                    if (
                            descricao == null ||
                                    descricao.isBlank()
                    ) {
                        descricao = "-";
                    }

                    adicionarCelulaTabela(
                            tabela,
                            descricao,
                            fundo,
                            azulEscuro
                    );

                    adicionarCelulaTabela(
                            tabela,
                            transacao.getCategoria() != null
                                    ? transacao.getCategoria()
                                    : "-",
                            fundo,
                            azulEscuro
                    );

                    Color corTipo =
                            "RECEITA".equalsIgnoreCase(
                                    transacao.getTipo()
                            )
                                    ? verde
                                    : vermelho;

                    adicionarCelulaTabela(
                            tabela,
                            transacao.getTipo() != null
                                    ? transacao.getTipo()
                                    : "-",
                            fundo,
                            corTipo
                    );

                    Color corValor =
                            "RECEITA".equalsIgnoreCase(
                                    transacao.getTipo()
                            )
                                    ? verde
                                    : vermelho;

                    String sinal =
                            "RECEITA".equalsIgnoreCase(
                                    transacao.getTipo()
                            )
                                    ? "+"
                                    : "-";

                    adicionarCelulaTabela(
                            tabela,
                            sinal +
                                    formatarMoeda(
                                            transacao.getValor()
                                    ),
                            fundo,
                            corValor
                    );

                    linhaAlternada =
                            !linhaAlternada;
                }

                document.add(
                        tabela
                );
            }

            document.add(
                    new Paragraph(" ")
            );

            Paragraph rodape =
                    new Paragraph(
                            "Gerado pelo ControlAmigo",
                            new Font(
                                    Font.HELVETICA,
                                    8,
                                    Font.NORMAL,
                                    cinzaTexto
                            )
                    );

            rodape.setAlignment(
                    Element.ALIGN_CENTER
            );

            rodape.setSpacingBefore(
                    15
            );

            document.add(
                    rodape
            );

        } catch (DocumentException e) {

            throw new RuntimeException(
                    "Erro ao gerar relatório PDF.",
                    e
            );

        } finally {

            if (document.isOpen()) {
                document.close();
            }
        }

        return outputStream.toByteArray();
    }

    private void adicionarCardResumo(
            PdfPTable tabela,
            String titulo,
            String valor,
            Color corValor,
            Color fundo
    ) {

        PdfPCell celula =
                new PdfPCell();

        celula.setBackgroundColor(
                fundo
        );

        celula.setPadding(
                12
        );

        celula.setBorderWidth(
                0
        );

        Paragraph tituloParagrafo =
                new Paragraph(
                        titulo,
                        new Font(
                                Font.HELVETICA,
                                9,
                                Font.NORMAL,
                                new Color(
                                        128,
                                        144,
                                        165
                                )
                        )
                );

        Paragraph valorParagrafo =
                new Paragraph(
                        valor,
                        new Font(
                                Font.HELVETICA,
                                13,
                                Font.BOLD,
                                corValor
                        )
                );

        valorParagrafo.setSpacingBefore(
                4
        );

        celula.addElement(
                tituloParagrafo
        );

        celula.addElement(
                valorParagrafo
        );

        tabela.addCell(
                celula
        );
    }

    private void adicionarCabecalhoTabela(
            PdfPTable tabela,
            String texto,
            Color fundo
    ) {

        PdfPCell celula =
                new PdfPCell(
                        new Phrase(
                                texto,
                                new Font(
                                        Font.HELVETICA,
                                        9,
                                        Font.BOLD,
                                        Color.WHITE
                                )
                        )
                );

        celula.setBackgroundColor(
                fundo
        );

        celula.setPadding(
                8
        );

        celula.setBorderColor(
                fundo
        );

        tabela.addCell(
                celula
        );
    }

    private void adicionarCelulaTabela(
            PdfPTable tabela,
            String texto,
            Color fundo,
            Color corTexto
    ) {

        PdfPCell celula =
                new PdfPCell(
                        new Phrase(
                                texto,
                                new Font(
                                        Font.HELVETICA,
                                        8,
                                        Font.NORMAL,
                                        corTexto
                                )
                        )
                );

        celula.setBackgroundColor(
                fundo
        );

        celula.setPadding(
                7
        );

        celula.setBorderColor(
                new Color(
                        230,
                        236,
                        241
                )
        );

        tabela.addCell(
                celula
        );
    }

    private String formatarMoeda(
            double valor
    ) {

        return String.format(
                        "R$ %,.2f",
                        valor
                )
                .replace(",", "X")
                .replace(".", ",")
                .replace("X", ".");
    }

    private String nomeMes(
            int mes
    ) {

        return switch (mes) {

            case 1 -> "Janeiro";
            case 2 -> "Fevereiro";
            case 3 -> "Março";
            case 4 -> "Abril";
            case 5 -> "Maio";
            case 6 -> "Junho";
            case 7 -> "Julho";
            case 8 -> "Agosto";
            case 9 -> "Setembro";
            case 10 -> "Outubro";
            case 11 -> "Novembro";
            case 12 -> "Dezembro";

            default ->
                    "Período";
        };
    }
}