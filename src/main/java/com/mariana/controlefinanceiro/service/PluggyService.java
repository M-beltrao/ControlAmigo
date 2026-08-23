package com.mariana.controlefinanceiro.service;

import com.mariana.controlefinanceiro.model.ContaBancaria;
import com.mariana.controlefinanceiro.model.Transacao;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PluggyService {

    @Value("${pluggy.client-id}")
    private String clientId;

    @Value("${pluggy.client-secret}")
    private String clientSecret;

    @Value("${pluggy.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate =
            new RestTemplate();

    private final TransacaoService transacaoService;

    private final ContaBancariaService contaBancariaService;

    public PluggyService(
            TransacaoService transacaoService,
            ContaBancariaService contaBancariaService
    ) {

        this.transacaoService =
                transacaoService;

        this.contaBancariaService =
                contaBancariaService;
    }

    public String gerarApiKey() {

        String url =
                baseUrl + "/auth";

        Map<String, String> body =
                new HashMap<>();

        body.put(
                "clientId",
                clientId
        );

        body.put(
                "clientSecret",
                clientSecret
        );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        HttpEntity<Map<String, String>> request =
                new HttpEntity<>(
                        body,
                        headers
                );

        ResponseEntity<Map> response =
                restTemplate.postForEntity(
                        url,
                        request,
                        Map.class
                );

        Map resposta =
                response.getBody();

        if (resposta == null) {

            throw new RuntimeException(
                    "Não foi possível autenticar na Pluggy."
            );
        }

        Object apiKey =
                resposta.get("apiKey");

        if (apiKey == null) {

            apiKey =
                    resposta.get(
                            "accessToken"
                    );
        }

        if (apiKey == null) {

            throw new RuntimeException(
                    "A Pluggy não retornou uma API Key."
            );
        }

        return apiKey.toString();
    }

    public Map buscarContas(
            String itemId
    ) {

        String apiKey =
                gerarApiKey();

        String url =
                baseUrl +
                        "/accounts?itemId=" +
                        itemId;

        HttpHeaders headers =
                new HttpHeaders();

        headers.set(
                "X-API-KEY",
                apiKey
        );

        headers.setAccept(
                List.of(
                        MediaType.APPLICATION_JSON
                )
        );

        HttpEntity<Void> request =
                new HttpEntity<>(
                        headers
                );

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        request,
                        Map.class
                );

        return response.getBody();
    }

    public List<Map<String, Object>> buscarTransacoes(
            String accountId
    ) {

        String apiKey =
                gerarApiKey();

        String url =
                baseUrl +
                        "/v2/transactions?accountId=" +
                        accountId;

        HttpHeaders headers =
                new HttpHeaders();

        headers.set(
                "X-API-KEY",
                apiKey
        );

        headers.setAccept(
                List.of(
                        MediaType.APPLICATION_JSON
                )
        );

        HttpEntity<Void> request =
                new HttpEntity<>(
                        headers
                );

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        request,
                        Map.class
                );

        Map<String, Object> corpo =
                response.getBody();

        if (corpo == null) {

            return new ArrayList<>();
        }

        Object resultadosObjeto =
                corpo.get("results");

        if (!(resultadosObjeto instanceof List<?>)) {

            return new ArrayList<>();
        }

        List<?> resultados =
                (List<?>) resultadosObjeto;

        List<Map<String, Object>> transacoesFiltradas =
                new ArrayList<>();

        for (Object objeto : resultados) {

            if (!(objeto instanceof Map<?, ?>)) {
                continue;
            }

            Map<?, ?> transacao =
                    (Map<?, ?>) objeto;

            String tipoPluggy =
                    String.valueOf(
                            transacao.get("type")
                    );

            String tipoControlAmigo;

            if (
                    "DEBIT".equalsIgnoreCase(
                            tipoPluggy
                    )
            ) {

                tipoControlAmigo =
                        "DESPESA";

            } else if (
                    "CREDIT".equalsIgnoreCase(
                            tipoPluggy
                    )
            ) {

                tipoControlAmigo =
                        "RECEITA";

            } else {

                continue;
            }

            Object valorObjeto =
                    transacao.get("amount");

            double valor = 0;

            if (valorObjeto instanceof Number) {

                valor =
                        ((Number) valorObjeto)
                                .doubleValue();
            }

            Map<String, Object> transacaoFiltrada =
                    new HashMap<>();

            transacaoFiltrada.put(
                    "id",
                    transacao.get("id")
            );

            transacaoFiltrada.put(
                    "descricao",
                    transacao.get(
                            "description"
                    )
            );

            transacaoFiltrada.put(
                    "valor",
                    Math.abs(valor)
            );

            transacaoFiltrada.put(
                    "data",
                    transacao.get("date")
            );

            transacaoFiltrada.put(
                    "categoria",
                    transacao.get(
                            "category"
                    )
            );

            transacaoFiltrada.put(
                    "tipo",
                    tipoControlAmigo
            );

            transacoesFiltradas.add(
                    transacaoFiltrada
            );
        }

        return transacoesFiltradas;
    }

    public Map<String, Object> sincronizarTransacoes(
            Long usuarioId,
            String accountId
    ) {

        ContaBancaria contaBancaria =
                buscarContaPorAccountId(
                        usuarioId,
                        accountId
                );

        List<Map<String, Object>> transacoesPluggy =
                buscarTransacoes(
                        accountId
                );

        int importadas = 0;
        int ignoradas = 0;

        for (
                Map<String, Object> dados :
                transacoesPluggy
        ) {

            String identificadorExterno =
                    String.valueOf(
                            dados.get("id")
                    );

            if (
                    transacaoService
                            .existePorIdentificadorExterno(
                                    identificadorExterno
                            )
            ) {

                transacaoService
                        .vincularContaBancaria(
                                identificadorExterno,
                                contaBancaria
                        );

                ignoradas++;
                continue;
            }

            Transacao transacao =
                    new Transacao();

            Object valorObjeto =
                    dados.get("valor");

            double valor =
                    ((Number) valorObjeto)
                            .doubleValue();

            transacao.setValor(
                    valor
            );

            String descricao =
                    String.valueOf(
                            dados.get(
                                    "descricao"
                            )
                    );

            transacao.setDestinatario(
                    descricao
            );

            transacao.setDescricao(
                    descricao
            );

            Object categoria =
                    dados.get(
                            "categoria"
                    );

            transacao.setCategoria(
                    categoria != null
                            ? categoria.toString()
                            : "Outros"
            );

            String dataTexto =
                    String.valueOf(
                            dados.get("data")
                    );

            transacao.setData(
                    OffsetDateTime
                            .parse(
                                    dataTexto
                            )
                            .toLocalDate()
            );

            transacao.setTipo(
                    String.valueOf(
                            dados.get("tipo")
                    )
            );

            transacao.setIdentificadorExterno(
                    identificadorExterno
            );

            transacaoService
                    .salvarTransacaoBancaria(
                            usuarioId,
                            contaBancaria,
                            transacao
                    );

            importadas++;
        }

        Map<String, Object> resultado =
                new HashMap<>();

        resultado.put(
                "mensagem",
                "Sincronização concluída."
        );

        resultado.put(
                "totalRecebidas",
                transacoesPluggy.size()
        );

        resultado.put(
                "importadas",
                importadas
        );

        resultado.put(
                "ignoradas",
                ignoradas
        );

        return resultado;
    }

    private ContaBancaria buscarContaPorAccountId(
            Long usuarioId,
            String accountId
    ) {

        List<ContaBancaria> contas =
                contaBancariaService
                        .listarPorUsuario(
                                usuarioId
                        );

        return contas
                .stream()
                .filter(
                        conta ->
                                accountId.equals(
                                        conta.getAccountId()
                                )
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Conta bancária não encontrada para o accountId informado."
                        )
                );
    }

    public Map<String, Object> sincronizarContas(
            Long usuarioId,
            String itemId
    ) {

        Map respostaPluggy =
                buscarContas(
                        itemId
                );

        if (respostaPluggy == null) {

            throw new RuntimeException(
                    "Não foi possível buscar as contas."
            );
        }

        Object resultadosObjeto =
                respostaPluggy.get(
                        "results"
                );

        if (!(resultadosObjeto instanceof List<?>)) {

            throw new RuntimeException(
                    "Nenhuma conta encontrada."
            );
        }

        List<?> contas =
                (List<?>) resultadosObjeto;

        int salvas = 0;
        int ignoradas = 0;

        for (Object objeto : contas) {

            if (!(objeto instanceof Map<?, ?>)) {
                continue;
            }

            Map<?, ?> dadosConta =
                    (Map<?, ?>) objeto;

            String tipo =
                    String.valueOf(
                            dadosConta.get("type")
                    );

            if (
                    !"BANK".equalsIgnoreCase(
                            tipo
                    )
            ) {

                ignoradas++;
                continue;
            }

            ContaBancaria conta =
                    new ContaBancaria();

            conta.setAccountId(
                    String.valueOf(
                            dadosConta.get("id")
                    )
            );

            conta.setItemId(
                    itemId
            );

            conta.setNomeBanco(
                    String.valueOf(
                            dadosConta.get("name")
                    )
            );

            conta.setTipoConta(
                    String.valueOf(
                            dadosConta.get(
                                    "subtype"
                            )
                    )
            );

            Object saldoObjeto =
                    dadosConta.get(
                            "balance"
                    );

            double saldo = 0;

            if (
                    saldoObjeto instanceof Number
            ) {

                saldo =
                        ((Number) saldoObjeto)
                                .doubleValue();
            }

            conta.setSaldo(
                    saldo
            );

            Object moeda =
                    dadosConta.get(
                            "currencyCode"
                    );

            conta.setMoeda(
                    moeda != null
                            ? moeda.toString()
                            : "BRL"
            );

            contaBancariaService
                    .salvarOuAtualizar(
                            usuarioId,
                            conta
                    );

            salvas++;
        }

        Map<String, Object> resultado =
                new HashMap<>();

        resultado.put(
                "mensagem",
                "Contas sincronizadas com sucesso."
        );

        resultado.put(
                "contasSalvas",
                salvas
        );

        resultado.put(
                "contasIgnoradas",
                ignoradas
        );

        return resultado;
    }

    public Map<String, Object> sincronizarUsuario(
            Long usuarioId
    ) {

        List<ContaBancaria> contas =
                contaBancariaService
                        .listarPorUsuario(
                                usuarioId
                        );

        if (contas.isEmpty()) {

            throw new RuntimeException(
                    "Nenhuma conta bancária vinculada ao usuário."
            );
        }

        List<String> itensSincronizados =
                new ArrayList<>();

        int contasAtualizadas = 0;
        int transacoesImportadas = 0;
        int transacoesIgnoradas = 0;
        int totalTransacoesRecebidas = 0;

        for (ContaBancaria conta : contas) {

            String itemId =
                    conta.getItemId();

            if (
                    itemId != null &&
                            !itemId.isBlank() &&
                            !itensSincronizados.contains(
                                    itemId
                            )
            ) {

                Map<String, Object> resultadoContas =
                        sincronizarContas(
                                usuarioId,
                                itemId
                        );

                Object quantidadeContas =
                        resultadoContas.get(
                                "contasSalvas"
                        );

                if (
                        quantidadeContas instanceof Number
                ) {

                    contasAtualizadas +=
                            ((Number) quantidadeContas)
                                    .intValue();
                }

                itensSincronizados.add(
                        itemId
                );
            }
        }

        List<ContaBancaria> contasAtualizadasUsuario =
                contaBancariaService
                        .listarPorUsuario(
                                usuarioId
                        );

        for (
                ContaBancaria conta :
                contasAtualizadasUsuario
        ) {

            String accountId =
                    conta.getAccountId();

            if (
                    accountId == null ||
                            accountId.isBlank()
            ) {
                continue;
            }

            Map<String, Object> resultadoTransacoes =
                    sincronizarTransacoes(
                            usuarioId,
                            accountId
                    );

            Object importadas =
                    resultadoTransacoes.get(
                            "importadas"
                    );

            Object ignoradas =
                    resultadoTransacoes.get(
                            "ignoradas"
                    );

            Object recebidas =
                    resultadoTransacoes.get(
                            "totalRecebidas"
                    );

            if (
                    importadas instanceof Number
            ) {

                transacoesImportadas +=
                        ((Number) importadas)
                                .intValue();
            }

            if (
                    ignoradas instanceof Number
            ) {

                transacoesIgnoradas +=
                        ((Number) ignoradas)
                                .intValue();
            }

            if (
                    recebidas instanceof Number
            ) {

                totalTransacoesRecebidas +=
                        ((Number) recebidas)
                                .intValue();
            }
        }

        Map<String, Object> resultado =
                new HashMap<>();

        resultado.put(
                "mensagem",
                "Sincronização bancária concluída."
        );

        resultado.put(
                "contasAtualizadas",
                contasAtualizadas
        );

        resultado.put(
                "transacoesRecebidas",
                totalTransacoesRecebidas
        );

        resultado.put(
                "transacoesImportadas",
                transacoesImportadas
        );

        resultado.put(
                "transacoesIgnoradas",
                transacoesIgnoradas
        );

        return resultado;
    }

    public Map<String, Object> gerarConnectToken(
            Long usuarioId
    ) {

        String apiKey =
                gerarApiKey();

        String url =
                baseUrl +
                        "/connect_token";

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.set(
                "X-API-KEY",
                apiKey
        );

        Map<String, Object> options =
                new HashMap<>();

        options.put(
                "clientUserId",
                usuarioId.toString()
        );

        options.put(
                "avoidDuplicates",
                true
        );

        Map<String, Object> body =
                new HashMap<>();

        body.put(
                "options",
                options
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(
                        body,
                        headers
                );

        ResponseEntity<Map> response =
                restTemplate.postForEntity(
                        url,
                        request,
                        Map.class
                );

        Map resposta =
                response.getBody();

        if (resposta == null) {

            throw new RuntimeException(
                    "Não foi possível gerar o Connect Token."
            );
        }

        Object accessToken =
                resposta.get(
                        "accessToken"
                );

        if (accessToken == null) {

            throw new RuntimeException(
                    "A Pluggy não retornou o Connect Token."
            );
        }

        Map<String, Object> resultado =
                new HashMap<>();

        resultado.put(
                "accessToken",
                accessToken.toString()
        );

        return resultado;
    }
}