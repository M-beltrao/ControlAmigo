# 💰 ControlAmigo

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Status](https://img.shields.io/badge/Status-Em%20desenvolvimento-yellow)

Aplicação web para **controle financeiro pessoal**, desenvolvida com foco em organização de receitas e despesas, gerenciamento de usuários e acompanhamento de transações.

> 🚧 **Projeto em desenvolvimento**

## 📌 Sobre o projeto

O **ControlAmigo** foi criado para facilitar o registro e a organização das movimentações financeiras do dia a dia.

A proposta é permitir que o usuário acompanhe suas entradas e saídas de forma simples, mantendo um histórico das transações e tendo uma visão mais clara da própria vida financeira.

## ✨ Funcionalidades

Atualmente, o projeto conta com:

- Cadastro de usuários
- Login de usuários
- Validação de e-mail e nome de usuário já cadastrados
- Criptografia de senhas
- Cadastro de receitas e despesas
- Listagem de transações
- Edição de transações
- Exclusão de transações
- Associação das transações ao usuário
- Tratamento de exceções da API

## 🚀 Próximas funcionalidades

O projeto ainda está evoluindo. Entre as próximas melhorias planejadas estão:

- Exibição de saldo atualizado
- Histórico financeiro mais completo
- Filtros por categoria e período
- Gráficos de receitas e despesas
- Relatório mensal em PDF
- Melhorias na interface e experiência do usuário

## 🛠️ Tecnologias utilizadas

### Back-end

- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven

### Banco de dados

- PostgreSQL

### Front-end

- HTML
- CSS
- JavaScript

### Ferramentas

- IntelliJ IDEA
- Postman
- pgAdmin
- Git
- GitHub

## 🔐 Segurança

As credenciais do banco de dados não são armazenadas diretamente no código.

O projeto utiliza variáveis de ambiente:

```properties
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Dessa forma, dados sensíveis permanecem fora do repositório.

## 📂 Estrutura do back-end

```text
src/main/java/com/mariana/controlefinanceiro
│
├── controller
│   ├── TransacaoController.java
│   └── UsuarioController.java
│
├── exception
│   ├── CadastroException.java
│   ├── GlobalExceptionHandler.java
│   ├── LoginException.java
│   ├── TransacaoNaoEncontradaException.java
│   └── UsuarioNaoEncontradoException.java
│
├── model
│   ├── Transacao.java
│   └── Usuario.java
│
├── repository
│   ├── TransacaoRepository.java
│   └── UsuarioRepository.java
│
├── service
│   ├── TransacaoService.java
│   └── UsuarioService.java
│
└── ControleFinanceiroApplication.java
```

## ▶️ Como executar o projeto

### Pré-requisitos

Para executar o projeto localmente, é necessário ter:

- Java instalado
- PostgreSQL instalado
- Maven
- Banco de dados `controle_financeiro` criado

Configure as variáveis de ambiente:

```text
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

Depois execute a aplicação Spring Boot.

A API ficará disponível em:

```text
http://localhost:8080
```

## 📚 Aprendizados

Este projeto está sendo utilizado para aprofundar conhecimentos em:

- Programação orientada a objetos
- Desenvolvimento de APIs REST
- Arquitetura em camadas
- Integração com banco de dados
- Spring Boot e JPA
- Tratamento de exceções
- Segurança de senhas
- Versionamento de código com Git e GitHub

## 👩‍💻 Autora

**Mariana Beltrão**

Estudante de Sistemas para Internet e desenvolvedora em formação.

---

⭐ O projeto continuará recebendo melhorias conforme novas funcionalidades forem desenvolvidas.