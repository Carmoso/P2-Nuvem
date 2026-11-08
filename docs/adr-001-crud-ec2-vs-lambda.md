# ADR-001 — Escolha de Docker na Amazon EC2 para a API principal

**Status:** Aceita  
**Data:** 08/11/2026  
**Projeto:** EventHub — Sistema de Gestão de Eventos e Auditórios

## 1. Contexto

O EventHub é uma aplicação web desenvolvida para gerenciar auditórios, eventos, disponibilidade de espaços, banners e relatórios gerenciais.

O projeto utiliza recursos da AWS disponibilizados pelo AWS Academy Learner Lab e precisa integrar uma API REST, um banco de dados PostgreSQL, armazenamento de arquivos no Amazon S3 e processamento serverless.

Durante o planejamento, foi necessário decidir entre hospedar as operações de cadastro, consulta, atualização e exclusão (CRUD) em uma aplicação conteinerizada na Amazon EC2 ou implementar essas operações utilizando funções AWS Lambda.

A decisão considerou os requisitos da disciplina, o tempo de desenvolvimento, a complexidade operacional, as limitações do ambiente acadêmico e a necessidade de integração com o Amazon RDS.

## 2. Alternativas consideradas

### Alternativa A — API REST em Docker na Amazon EC2

Consiste em executar uma aplicação Python com Flask e Gunicorn dentro de um contêiner Docker hospedado em uma instância Amazon EC2.

**Vantagens:**
- Centralização das rotas e regras de negócio em uma aplicação.
- Facilidade de desenvolvimento, depuração e testes locais.
- Maior controle sobre a execução e a configuração do ambiente.
- Reutilização de conexões e componentes da aplicação.
- Possibilidade de configurar reinicialização automática do contêiner.

**Desvantagens:**
- Necessidade de administrar a instância e o contêiner.
- Responsabilidade pela disponibilidade e atualização do ambiente.
- Capacidade de processamento limitada aos recursos provisionados.
- Necessidade de gerenciar o endereço público e o acesso à API.

### Alternativa B — CRUD integralmente em AWS Lambda

Consiste em implementar as operações da API como funções AWS Lambda, integradas ao Amazon API Gateway e ao RDS PostgreSQL.

**Vantagens:**
- Execução sob demanda.
- Escalabilidade gerenciada pela AWS.
- Menor necessidade de administrar servidores.
- Possibilidade de cobrança proporcional à utilização.

**Desvantagens:**
- Maior necessidade de configurar integrações entre funções, API Gateway e banco de dados.
- Possibilidade de latência adicional em inicializações a frio.
- Necessidade de administrar cuidadosamente as conexões ao PostgreSQL.
- Maior esforço de adaptação das rotas e regras de negócio para o modelo serverless.

Essas características não tornam uma alternativa universalmente superior à outra; sua adequação depende dos requisitos e do contexto de utilização.

## 3. Decisão adotada

Foi escolhida uma **arquitetura híbrida**, utilizando Docker na Amazon EC2 para a API REST principal e AWS Lambda para funcionalidades específicas.

A API desenvolvida em Python e Flask é executada por Gunicorn dentro de um contêiner Docker na EC2. Ela concentra as operações de CRUD, validação da capacidade dos auditórios, verificação de conflitos de agendamento, disponibilidade e controle dos estados dos eventos.

O banco de dados PostgreSQL é hospedado no Amazon RDS, sem acesso público, em subnets privadas. A comunicação com o banco é controlada por Security Groups.

O AWS Lambda é utilizado em duas funcionalidades:
- **LambdaThumb:** processamento de imagens enviadas ao Amazon S3 e atualização das referências às miniaturas no banco.
- **LambdaRelatorio:** consulta e consolidação de informações gerenciais, com endpoint disponibilizado pelo Amazon API Gateway.

O frontend estático é hospedado no Amazon S3 e realiza requisições à API principal e ao endpoint de relatórios.

## 4. Justificativa

A escolha da EC2 com Docker permitiu concentrar as regras de negócio da aplicação em um único backend, simplificando o desenvolvimento e a realização dos testes funcionais.

O Docker também facilitou a padronização do ambiente de execução e a configuração da inicialização automática da API.

Por outro lado, o processamento de imagens e a geração de relatórios foram implementados com funções Lambda para demonstrar a integração de serviços serverless e executar responsabilidades específicas de maneira desacoplada da API principal.

A arquitetura híbrida atende aos objetivos acadêmicos do projeto e permite demonstrar diferentes modelos de computação em nuvem em uma mesma solução.

## 5. Consequências da decisão

A utilização da EC2 exige manutenção da instância, acompanhamento do Docker e configuração adequada das permissões de rede.

No ambiente do Learner Lab, o endereço IP público pode mudar entre sessões. Para reduzir essa dependência, foi implementado um serviço systemd que identifica o endereço atual pelo IMDSv2, gera o arquivo `config.js` e o publica automaticamente no bucket S3 do frontend.

O contêiner principal também foi configurado para obter credenciais temporárias automaticamente por meio do `LabInstanceProfile` e da role `LabRole`, sem depender do arquivo local de credenciais AWS.

Essa recuperação foi validada por testes de inicialização, autenticação, consulta ao RDS, publicação no S3 e acesso à API.

Como limitações, a solução ainda depende da disponibilidade da instância EC2 e não possui mecanismos de alta disponibilidade ou escalabilidade automática da API principal. Uma implantação de produção também exigiria HTTPS e controles adicionais de segurança e operação.

## 6. Conclusão

A arquitetura híbrida foi considerada a alternativa mais adequada para os objetivos, recursos e restrições do EventHub.

A utilização de Docker na EC2 favoreceu a organização da API e das regras de negócio, enquanto o uso de AWS Lambda possibilitou implementar o processamento de imagens e os relatórios gerenciais de forma desacoplada.

A decisão atende à necessidade de justificar a escolha entre uma API conteinerizada e uma implementação CRUD integralmente serverless, mantendo o projeto compatível com as condições do AWS Academy Learner Lab.
