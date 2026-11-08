# Evidências de Testes — EventHub

Esta pasta reúne as capturas de tela utilizadas para comprovar a execução, o monitoramento e a integração dos serviços AWS do projeto EventHub.

## 1. LambdaThumb — Investigação de erro

![Erro de dependência da LambdaThumb](imagens/lambdathumb-erro-dependencia.png)

A captura registra um erro `Runtime.ImportModuleError`, identificado em 06/11/2026 durante a execução da função LambdaThumb.

A mensagem `No module named 'psycopg'` indica que a biblioteca necessária para a conexão com o PostgreSQL não estava disponível no ambiente de execução naquele momento.

O erro foi identificado durante o desenvolvimento. As execuções registradas no dia seguinte não apresentaram erros nas métricas consultadas.

## 2. LambdaThumb — Métricas do CloudWatch

![Métricas da LambdaThumb](imagens/lambdathumb-metricas-cloudwatch.png)

A captura apresenta o monitoramento de invocações e erros da função LambdaThumb.

Segundo as métricas consultadas no CloudWatch:

- **06/11/2026:** 4 invocações e 1 erro.
- **07/11/2026:** 5 invocações e nenhum erro.

Os registros demonstram a execução da função e permitem acompanhar os resultados após a falha identificada durante o desenvolvimento.

A geração e a visualização de uma miniatura WebP também foram validadas em testes posteriores da aplicação.

## 3. LambdaRelatorio — Métricas do CloudWatch

![Métricas da LambdaRelatorio](imagens/lambdarelatorio-metricas-cloudwatch.png)

A captura registra o monitoramento da função LambdaRelatorio, responsável pela geração do relatório gerencial de utilização dos auditórios.

Durante a auditoria dos logs, foram identificados 51 registros `REPORT`, sem linhas correspondentes aos indicadores de erro pesquisados.

O endpoint `GET /relatorios/ocupacao`, disponibilizado pelo Amazon API Gateway, também foi testado com retorno HTTP 200.

## 4. Segurança do RDS — RNF-01

### Acesso público desabilitado
![RDS sem acesso público](imagens/rds-acesso-privado-cli.png)

Consulta AWS CLI confirmando `PubliclyAccessible = false` para o banco `eventos-db`.

### Security Groups
![Regras de segurança do RDS](imagens/rds-security-groups.png)

Regras de entrada do PostgreSQL restritas aos grupos autorizados da EC2 e das Lambdas.

### Subnets privadas
![Rotas das subnets privadas](imagens/rds-subnets-privadas-rotas.png)

Tabela de rotas das duas subnets do RDS, sem rota direta para um Internet Gateway.

## 5. Segurança das evidências

As capturas de tela não devem apresentar senhas, chaves de acesso AWS, tokens de sessão ou outras credenciais sensíveis.

As evidências complementam os registros técnicos presentes no `README.md`, em `specs/infra.md` e em `specs/design.md`.

## 6. Amazon EC2 e Docker

### Instância EC2

![Instância EC2 do EventHub](imagens/ec2-instancia-eventhub.png)

A captura apresenta a instância EC2 utilizada para hospedar a API principal do EventHub, identificada como `ec2-projeto-eventos`.

### Docker e funcionamento da API

![Docker e API funcionando](imagens/ec2-docker-api-funcionando.png)

A evidência apresenta o contêiner `eventhub-api` em execução, utilizando autenticação automática pelo `LabRole` e respondendo às requisições da API.

## 7. Amazon S3

### Buckets do projeto

![Buckets S3 do EventHub](imagens/s3-buckets-eventhub.png)

A captura demonstra a utilização de buckets separados para hospedagem do frontend e armazenamento dos banners e miniaturas.

### Hospedagem do frontend

![Hospedagem estática no S3](imagens/s3-hospedagem-frontend.png)

Apresenta a configuração de hospedagem estática do bucket responsável pela interface web do EventHub.

### Gatilho da LambdaThumb

![Notificação do S3 para LambdaThumb](imagens/s3-gatilho-lambdathumb.png)

Demonstra a configuração do evento `ObjectCreated`, com prefixo `uploads/`, que aciona a função `LambdaThumb` quando novos banners são enviados ao bucket.

### Miniaturas processadas

![Miniaturas armazenadas no S3](imagens/s3-miniaturas-processadas.png)

A captura apresenta os arquivos de miniaturas armazenados no S3 após o processamento das imagens.

## 8. Amazon API Gateway

### Rota de relatórios

![Rota de relatórios no API Gateway](imagens/apigateway-rota-relatorios.png)

Apresenta a configuração da rota `GET /relatorios/ocupacao`, responsável por disponibilizar os dados do relatório gerencial.

### Integração com LambdaRelatorio

![Integração API Gateway e LambdaRelatorio](imagens/apigateway-integracao-rota-relatorios.png)

Demonstra que o API Gateway está integrado à função `LambdaRelatorio`.

### Teste do endpoint

![Teste HTTP do relatório](imagens/apigateway-relatorio-http200.png)

Registra o teste de acesso ao endpoint do relatório, utilizado para comprovar sua disponibilidade por meio de uma resposta HTTP 200.

## 9. Frontend do EventHub

### Visão geral

![Dashboard principal do EventHub](imagens/frontend-visao-geral.png)

A captura apresenta o dashboard principal, com indicadores de eventos e auditórios, conexão com a API e visualização de banners.

### Gerenciamento de eventos

![Gerenciamento de eventos](imagens/frontend-gerenciamento-eventos.png)

Demonstra a interface de gerenciamento dos eventos cadastrados, com informações de agendamento e operações disponíveis.

### Gerenciamento de auditórios

![Gerenciamento de auditórios](imagens/frontend-gerenciamento-auditorios.png)

Apresenta a interface de cadastro e administração dos auditórios utilizados pelo sistema.

### Consulta de disponibilidade

![Disponibilidade dos auditórios](imagens/frontend-disponibilidade-auditorios.png)

Demonstra uma consulta realizada para 250 participantes, no período de 24/11/2026, das 19h50 às 23h50, com dois auditórios disponíveis como resultado.

### Relatório gerencial

![Relatório gerencial do EventHub](imagens/frontend-relatorio-gerencial.png)

Apresenta os indicadores e as informações gerenciais obtidas por meio da integração entre o frontend, o API Gateway, a `LambdaRelatorio` e o RDS PostgreSQL.
