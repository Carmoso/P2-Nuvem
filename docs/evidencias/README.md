# Evidências de Testes — EventHub

Esta pasta reúne as capturas de tela utilizadas para comprovar a execução, o monitoramento e a integração dos serviços AWS do projeto EventHub.

## 1. LambdaThumb — Investigação de erro

![Erro de dependência da LambdaThumb](lambdathumb-erro-dependencia.png)

A captura registra um erro `Runtime.ImportModuleError`, identificado em 06/11/2026 durante a execução da função LambdaThumb.

A mensagem `No module named 'psycopg'` indica que a biblioteca necessária para a conexão com o PostgreSQL não estava disponível no ambiente de execução naquele momento.

O erro foi identificado durante o desenvolvimento. As execuções registradas no dia seguinte não apresentaram erros nas métricas consultadas.

## 2. LambdaThumb — Métricas do CloudWatch

![Métricas da LambdaThumb](lambdathumb-metricas-cloudwatch.png)

A captura apresenta o monitoramento de invocações e erros da função LambdaThumb.

Segundo as métricas consultadas no CloudWatch:

- **06/11/2026:** 4 invocações e 1 erro.
- **07/11/2026:** 5 invocações e nenhum erro.

Os registros demonstram a execução da função e permitem acompanhar os resultados após a falha identificada durante o desenvolvimento.

A geração e a visualização de uma miniatura WebP também foram validadas em testes posteriores da aplicação.

## 3. LambdaRelatorio — Métricas do CloudWatch

![Métricas da LambdaRelatorio](lambdarelatorio-metricas-cloudwatch.png)

A captura registra o monitoramento da função LambdaRelatorio, responsável pela geração do relatório gerencial de utilização dos auditórios.

Durante a auditoria dos logs, foram identificados 51 registros `REPORT`, sem linhas correspondentes aos indicadores de erro pesquisados.

O endpoint `GET /relatorios/ocupacao`, disponibilizado pelo Amazon API Gateway, também foi testado com retorno HTTP 200.

## 4. Segurança das evidências

As capturas de tela não devem apresentar senhas, chaves de acesso AWS, tokens de sessão ou outras credenciais sensíveis.

As evidências complementam os registros técnicos presentes no `README.md`, em `specs/infra.md` e em `specs/design.md`.
