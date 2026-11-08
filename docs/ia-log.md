# Registro de Interação com IA

Este documento registra a utilização de ferramentas de inteligência artificial como apoio ao desenvolvimento do projeto EventHub — Sistema de Gestão de Eventos e Auditórios Universitários.

A IA foi utilizada principalmente para auxiliar na organização de ideias, esclarecimento de dúvidas técnicas, revisão de código, interpretação de erros, elaboração de comandos e estruturação da documentação. As decisões sobre a implementação, a configuração dos serviços e a validação dos resultados foram realizadas pela equipe, considerando os requisitos do projeto e as limitações do ambiente AWS Academy Learner Lab.

Os registros apresentam um resumo das principais interações e atividades desenvolvidas, não sendo uma transcrição literal de todas as conversas.

## 2026-10-16 — Revisão da especificação

### Solicitação

Revisar `specs/spec.md` e verificar se ele respondia às perguntas: qual problema, para quem, quais histórias de usuário e como saber se cada história está pronta (critérios de aceite).

### Análise e alterações

- O documento já descrevia o problema, duas personas e cinco histórias, mas misturava critérios de aceite com detalhes técnicos de implementação AWS.
- Foi explicitado o público-alvo e o objetivo do sistema; os requisitos funcionais RF-01 a RF-05 foram separados dos critérios de aceite.
- As histórias US-01 a US-05 foram ajustadas com critérios verificáveis, incluindo conflito de horários, envio de banner, miniaturas, relatório de ocupação e acesso pela interface web.
- Foram registradas como decisões em aberto: identificação e permissões por perfil, formatos e tamanho de banners, dimensões, formato e recorte das miniaturas, além do filtro de período do relatório. Enquanto o período não fosse definido, o critério do relatório consideraria eventos com data até a data da consulta.

### Participação da IA e validação

A IA auxiliou na identificação de pontos que poderiam ser esclarecidos e sugeriu formas de organizar os requisitos e os critérios de aceite.

As alterações foram analisadas considerando o objetivo do projeto, preservando as funcionalidades previstas e evitando acrescentar requisitos desnecessários.

A validação do arquivo `specs/spec.md` não apontou erros.

## 2026-10-24 — Estruturação inicial do frontend

### Solicitação

Iniciar a Fase 1 do frontend do Sistema de Gestão de Eventos e Auditórios Universitários, lendo o repositório e usando `specs/design.md` como referência para a arquitetura AWS.

### Análise e alterações

- Foram analisados os arquivos existentes do repositório, incluindo as especificações, a API Flask e o esquema SQL.
- Foi proposta uma estrutura inicial de frontend em `src/`, mantendo separadas as páginas, componentes, serviços, estado global, mocks e tipos.
- Foi criado `src/types/index.ts` com tipos de usuários, auditórios, eventos, disponibilidade, bloqueios, upload de banners, relatórios e contratos REST compatíveis com a API existente.
- Foi criado `src/mocks/db.ts` com dados simulados de usuários, auditórios, eventos, bloqueios de manutenção e métricas de ocupação.
- Os DTOs REST refletiam os campos `snake_case` utilizados no backend, enquanto os modelos da interface utilizavam `camelCase`.
- Campos ainda não implementados no backend, como status do auditório e banner, permaneceram representados apenas no domínio da interface e nos dados simulados.
- Não foram configurados Vite, dependências ou telas nessa fase, conforme o planejamento inicial.

### Participação da IA e validação

A IA auxiliou na análise da estrutura existente e apresentou sugestões para organizar os tipos e os dados simulados.

Essa proposta foi utilizada como estudo inicial, mas não determinou obrigatoriamente a tecnologia da interface final.

Os diagnósticos dos arquivos `src/types/index.ts` e `src/mocks/db.ts` não apontaram erros.

## Outubro e novembro de 2026 — Desenvolvimento das funcionalidades

### Solicitação

Desenvolver e revisar as funcionalidades de gerenciamento de eventos e auditórios, considerando os requisitos funcionais, o banco de dados PostgreSQL e a API Flask.

### Análise e alterações

Durante o desenvolvimento, foram trabalhadas as operações de cadastro, consulta, atualização e exclusão de eventos e auditórios, além das regras necessárias para o funcionamento do sistema.

Entre os pontos abordados estavam a validação das capacidades dos espaços, o número previsto de participantes, a verificação de conflitos entre agendamentos, as datas dos eventos e os critérios para consulta de disponibilidade.

Também foram realizados ajustes relacionados ao controle de status dos eventos e às condições de utilização dos auditórios, incluindo situações de manutenção e inatividade.

### Participação da IA

A IA foi utilizada como apoio para esclarecer dúvidas sobre a lógica das funcionalidades, sugerir alternativas de implementação e auxiliar na interpretação de mensagens de erro.

Em diferentes momentos, foram discutidas possíveis causas de comportamentos inesperados. As sugestões recebidas foram comparadas com o funcionamento real da aplicação antes de qualquer ajuste.

A definição das regras de funcionamento e a escolha das alterações aplicadas permaneceram sob responsabilidade da equipe.

### Validação

As funcionalidades foram verificadas por meio de requisições HTTP, consultas aos dados e testes realizados na interface.

Quando um teste apresentava resultado diferente do esperado, o comportamento era analisado e a implementação era ajustada conforme a necessidade.

A validação prática foi essencial, pois nem toda hipótese apresentada pela IA correspondia à causa real do problema.

## Outubro e novembro de 2026 — Implementação do frontend definitivo

### Solicitação

Criar uma interface web que permitisse utilizar as funcionalidades do EventHub e apresentar as informações de maneira organizada.

### Análise e alterações

Após a proposta inicial com TypeScript e dados simulados, foi adotada uma implementação com HTML, CSS e JavaScript para a interface efetivamente utilizada no projeto.

A aplicação passou a utilizar os arquivos da pasta `frontend/`, principalmente `index.html`, `style.css` e `script.js`.

Foram desenvolvidas telas para visualização geral do sistema, gerenciamento de eventos, gerenciamento de auditórios, consulta de disponibilidade e apresentação do relatório gerencial.

A interface foi integrada aos serviços da aplicação para apresentar dados reais, permitindo consultar informações e realizar operações sobre os registros existentes.

Os arquivos TypeScript da proposta inicial permaneceram no repositório como parte do histórico de desenvolvimento, mas não fazem parte do frontend publicado.

### Participação da IA

A IA auxiliou na discussão da organização das telas, na revisão de trechos de código e na identificação de possíveis problemas de integração entre o frontend e a API.

As sugestões foram adaptadas à estrutura escolhida para o sistema, considerando a simplicidade de publicação, os recursos disponíveis e os requisitos da disciplina.

A organização final da interface e a decisão de utilizar HTML, CSS e JavaScript foram realizadas durante o desenvolvimento do projeto.

### Validação

O frontend foi testado por meio de sua versão publicada no Amazon S3.

Foram verificadas a comunicação com a API, a apresentação das informações, o funcionamento dos formulários e as consultas disponibilizadas aos usuários.

Também foram feitos ajustes na interface a partir dos resultados observados durante a utilização.

## Outubro e novembro de 2026 — Integração com os serviços AWS

### Solicitação

Configurar e integrar os serviços AWS necessários ao funcionamento do EventHub, incluindo EC2, RDS, S3, Lambda e API Gateway.

### Análise e alterações

A API Flask foi executada em um contêiner Docker hospedado em uma instância Amazon EC2, com acesso ao banco PostgreSQL do Amazon RDS.

O Amazon S3 foi utilizado para hospedar a interface web e armazenar arquivos relacionados aos banners dos eventos.

Foi configurada uma notificação no S3 para acionar a função `LambdaThumb` durante o envio de arquivos ao prefixo `uploads/`, permitindo o processamento de imagens e a geração de miniaturas.

Também foi utilizada a função `LambdaRelatorio`, integrada ao Amazon API Gateway, para disponibilizar as informações do relatório de ocupação dos auditórios.

### Participação da IA

A IA contribuiu principalmente com explicações sobre a integração entre os serviços, sugestões de comandos para configuração e testes, além do auxílio na interpretação de mensagens retornadas pelo ambiente AWS.

As configurações foram realizadas diretamente nos serviços, com acompanhamento dos resultados apresentados pelo console e pelo terminal.

Quando havia mais de uma possibilidade de implementação, a escolha considerava a arquitetura definida, os requisitos da disciplina e as limitações do Learner Lab.

### Validação

A integração foi verificada por meio de testes da API, consultas ao RDS, operações no S3, execuções das funções Lambda e acesso à rota de relatórios no API Gateway.

Os componentes foram testados progressivamente, permitindo identificar e corrigir problemas sem modificar toda a arquitetura ao mesmo tempo.

## Novembro de 2026 — Segurança da infraestrutura

### Solicitação

Verificar as configurações de segurança da aplicação e do banco de dados, especialmente as permissões de acesso à infraestrutura e a utilização de credenciais AWS.

### Análise e alterações

Foram analisadas as configurações do RDS, incluindo a opção de acesso público, as subnets e os Security Groups.

Foi confirmado que o banco de dados estava configurado com `PubliclyAccessible = false`, utilizando subnets privadas.

Também foram verificadas as regras da porta 5432, destinada ao PostgreSQL, para confirmar que o acesso estava limitado aos grupos de segurança autorizados.

O repositório foi examinado em busca de padrões conhecidos de credenciais e arquivos que não deveriam ser versionados. Também foram feitos ajustes no `.gitignore` para reduzir o risco de inclusão de determinados arquivos temporários.

### Participação da IA

A IA auxiliou na interpretação das informações de rede e permissões, além de sugerir verificações que poderiam ser realizadas por meio da AWS CLI e do Git.

Os resultados dessas verificações foram analisados pela equipe antes de serem considerados evidências de atendimento aos requisitos.

### Validação

Foram consultadas as configurações reais da infraestrutura e registradas capturas de tela dos resultados.

A busca por padrões de credenciais foi utilizada como medida de verificação, sem considerar que esse procedimento, isoladamente, garantiria a ausência de qualquer informação sensível.

## Novembro de 2026 — Recuperação do ambiente AWS Academy Learner Lab

### Solicitação

Reduzir os procedimentos manuais necessários para recuperar o funcionamento do EventHub após a interrupção e a reabertura do Learner Lab.

### Análise e alterações

Foi identificado que o endereço IP público da EC2 poderia mudar após a reinicialização do ambiente, afetando a comunicação entre o frontend hospedado no S3 e a API.

Para reduzir esse problema, foi utilizado um script responsável por identificar o IP público da instância e atualizar o arquivo de configuração consumido pelo frontend.

O script foi associado a um serviço `systemd`, permitindo sua execução durante a inicialização da EC2.

Também foram revisadas as configurações do Docker para permitir a reinicialização automática do contêiner da API.

A autenticação AWS utilizada pela aplicação foi ajustada para aproveitar o perfil de instância disponibilizado no ambiente, evitando a dependência da montagem de credenciais locais no contêiner.

### Participação da IA

A IA auxiliou na análise das possíveis causas da indisponibilidade, na elaboração de comandos de diagnóstico e na discussão de alternativas para automatizar a recuperação do ambiente.

As alterações foram aplicadas em etapas, de maneira que cada componente pudesse ser verificado antes de prosseguir.

A decisão de automatizar a atualização do IP e utilizar o perfil de instância foi tomada para atender às necessidades identificadas durante os testes reais do projeto.

### Validação

Foram realizados testes de reinicialização da EC2 e de recuperação do ambiente.

Após a mudança do endereço IP público, foi verificada a atualização da configuração publicada no S3.

Também foram confirmados o funcionamento do contêiner Docker, a autenticação pelo perfil da instância e a resposta HTTP 200 da API.

Em um teste posterior, a API inicialmente não respondeu imediatamente após o reinício do contêiner. Uma nova verificação mostrou que o serviço havia concluído sua inicialização e estava respondendo normalmente.

Essa situação reforçou a importância de considerar o tempo necessário para inicialização dos serviços antes de concluir que ocorreu uma falha.

## Novembro de 2026 — Investigação de erros e monitoramento

### Solicitação

Analisar os registros e as métricas das funções Lambda para verificar erros de execução e registrar evidências do funcionamento dos serviços.

### Análise e alterações

Foram consultados os registros do Amazon CloudWatch associados às funções `LambdaThumb` e `LambdaRelatorio`.

Durante a análise da `LambdaThumb`, foi identificada uma falha relacionada à ausência da dependência Python `psycopg`, registrada como `Runtime.ImportModuleError`.

As métricas consultadas mostraram quatro invocações e um erro em 06/11/2026. Em 07/11/2026, foram observadas cinco invocações sem erros nas métricas analisadas.

Também foram verificadas as execuções da função de relatórios e o funcionamento da geração e disponibilização de miniaturas.

### Participação da IA

A IA foi utilizada para auxiliar na interpretação dos registros, relacionar mensagens de erro com possíveis problemas de dependências e diferenciar ocorrências nos logs das métricas de execução.

A análise não foi limitada às hipóteses apresentadas pela ferramenta. Foram consultados os registros reais do CloudWatch e realizadas verificações dos componentes.

### Validação

Foram salvas evidências das métricas e dos registros de execução.

Os testes posteriores demonstraram o funcionamento das funcionalidades analisadas, mas a ocorrência histórica do erro foi preservada na documentação.

O registro do problema foi considerado importante para mostrar que a aplicação passou por etapas de investigação e correção durante seu desenvolvimento.

## Novembro de 2026 — Documentação técnica e decisões arquiteturais

### Solicitação

Revisar a documentação do projeto e organizar as informações de arquitetura, infraestrutura, requisitos, tarefas e decisões técnicas.

### Análise e alterações

Foram revisados documentos do repositório, incluindo `README.md`, `specs/design.md`, `specs/infra.md` e `specs/tasks.md`.

O diagrama de arquitetura foi atualizado para representar os serviços efetivamente utilizados no EventHub.

Também foi elaborado um registro de decisão arquitetural, ADR-001, explicando a utilização da API Flask em Docker na EC2 e a divisão das responsabilidades com os serviços serverless.

A organização das tarefas foi revisada para facilitar o acompanhamento do atendimento aos requisitos.

### Participação da IA

A IA auxiliou na estruturação das explicações, na revisão da clareza dos textos e na organização das informações técnicas.

Os conteúdos foram conferidos considerando a infraestrutura realmente configurada, evitando documentar recursos que não faziam parte da implementação.

A decisão arquitetural registrada no ADR levou em consideração o contexto do projeto, as ferramentas utilizadas e os critérios da equipe.

### Validação

A documentação foi comparada com os arquivos existentes no repositório e com as configurações verificadas no ambiente AWS.

Também foram revisados caminhos de arquivos, referências de imagens e instruções de execução.

## 2026-11-08 — Organização das evidências para entrega

### Solicitação

Reunir e organizar capturas de tela que demonstrassem o funcionamento do sistema e as configurações dos serviços utilizados.

### Análise e alterações

Foram registradas evidências do Amazon EC2, Docker, Amazon RDS, Amazon S3, AWS Lambda, Amazon CloudWatch, Amazon API Gateway e frontend do EventHub.

As imagens foram organizadas no diretório `docs/evidencias/imagens/`, com nomes relacionados às funcionalidades e aos serviços demonstrados.

Foi atualizado o documento `docs/evidencias/README.md`, agrupando as capturas por categoria e acrescentando uma breve descrição para cada evidência.

Ao final dessa etapa, o diretório reunia 20 imagens versionadas no GitHub.

### Participação da IA

A IA auxiliou na definição de uma estrutura de organização, na sugestão de nomes para os arquivos e na elaboração de descrições para as evidências.

A obtenção das capturas, a execução dos testes e a conferência dos resultados foram realizadas durante a utilização efetiva dos serviços e da aplicação.

### Validação

Foi realizada a sincronização do repositório entre o GitHub e a instância EC2, confirmando a presença das 20 imagens.

As referências do documento de evidências foram organizadas para permitir a visualização dos arquivos diretamente no GitHub.

## Considerações finais sobre o uso da IA

A utilização da inteligência artificial contribuiu para o desenvolvimento do EventHub, principalmente por facilitar a pesquisa de soluções, a compreensão de serviços AWS, a interpretação de erros e a organização de informações técnicas.

Entretanto, a IA não substituiu as atividades de implementação, configuração e validação do projeto. As sugestões apresentadas foram utilizadas como referências que precisavam ser analisadas e, quando necessário, adaptadas à realidade do ambiente.

Uma parte importante do aprendizado ocorreu justamente nos momentos em que uma sugestão não produziu o resultado esperado. Nessas situações, foi necessário investigar o problema, conferir a documentação e os resultados dos comandos e buscar outra abordagem.

O processo também demonstrou a importância de trabalhar de maneira incremental, realizando alterações menores e verificando seus efeitos antes de continuar.

Dessa forma, a IA foi utilizada como ferramenta complementar ao trabalho desenvolvido pela equipe, contribuindo para a resolução de problemas e para a documentação, enquanto as decisões técnicas e a responsabilidade pelos resultados permaneceram com os integrantes do projeto.
