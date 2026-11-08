# Acompanhamento das Tarefas — EventHub

**Projeto:** Sistema de Gestão de Eventos e Auditórios  
**Disciplina:** Serviços em Nuvem — Projeto 2  
**Ambiente:** AWS Academy Learner Lab  

## 1. Objetivo

Este documento registra o acompanhamento das atividades de desenvolvimento, implantação, testes e documentação do EventHub.

Cada tarefa apresenta um identificador, o requisito ou entregável associado, o responsável e seu status.

**Legenda:** Concluído — atividade realizada; Em revisão — implementada, mas com documentação ou evidências a conferir; Pendente — atividade ainda necessária; A confirmar — depende de confirmação da equipe.

**Responsável:** "Equipe EventHub" indica responsabilidade coletiva provisória. Os nomes dos integrantes poderão ser atribuídos individualmente antes da entrega.

## 2. Aula 1 — Organização e especificação

| ID | Tarefa | Requisito associado | Responsável | Status |
|---|---|---|---|---|
| T001 | Organizar o grupo e definir o domínio do projeto | Planejamento | Equipe EventHub | Concluído |
| T002 | Criar o repositório no GitHub | Entregável GitHub | Equipe EventHub | Concluído |
| T003 | Elaborar a especificação inicial do sistema | Especificação | Equipe EventHub | Concluído |
| T004 | Documentar personas e histórias de usuário | Especificação | Equipe EventHub | Concluído |
| T005 | Relacionar requisitos funcionais às histórias de usuário | Especificação | Equipe EventHub | Concluído |
| T006 | Registrar a utilização de IA | IA Log | Equipe EventHub | Em revisão |
| T007 | Confirmar o acesso do professor e o envio do repositório | Entrega inicial | Equipe EventHub | Concluído |

## 3. Aula 2 — Arquitetura e protótipo

| ID | Tarefa | Requisito associado | Responsável | Status |
|---|---|---|---|---|
| T008 | Revisar requisitos e critérios de aceite | Especificação | Equipe EventHub | Concluído |
| T009 | Documentar o modelo entidade-relacionamento | Design | Equipe EventHub | Concluído |
| T010 | Documentar as rotas da API | Design | Equipe EventHub | Concluído |
| T011 | Elaborar o diagrama da arquitetura AWS | Design | Equipe EventHub | Concluído |
| T012 | Publicar a imagem do diagrama no GitHub | Design | Equipe EventHub | Concluído |
| T013 | Criar o bucket S3 do frontend | RF05 da disciplina | Equipe EventHub | Concluído |
| T014 | Publicar e testar o frontend no S3 | RF05 da disciplina | Equipe EventHub | Concluído |
| T015 | Documentar a decisão arquitetural EC2 versus Lambda | RNF04 | Equipe EventHub | Concluído |

## 4. Aula 3 — Infraestrutura, banco de dados e CRUD

| ID | Tarefa | Requisito associado | Responsável | Status |
|---|---|---|---|---|
| T016 | Configurar a VPC e as subnets públicas e privadas | RNF01 | Equipe EventHub | Concluído |
| T017 | Criar a tabela de rotas privada do RDS | RNF01 | Equipe EventHub | Concluído |
| T018 | Configurar Security Groups da EC2, RDS e Lambdas | RNF01 | Equipe EventHub | Concluído |
| T019 | Criar o RDS PostgreSQL sem acesso público | RNF01 | Equipe EventHub | Concluído |
| T020 | Criar e versionar o esquema SQL | RF01 da disciplina | Equipe EventHub | Concluído |
| T021 | Implementar o relacionamento entre eventos e auditórios | RF01 da disciplina | Equipe EventHub | Concluído |
| T022 | Implementar a API Flask e conectar ao RDS | RF01 da disciplina | Equipe EventHub | Concluído |
| T023 | Implementar e testar CRUD das duas entidades | RF01 da disciplina | Equipe EventHub | Concluído |
| T024 | Implementar consultas SQL com JOIN | RF01 da disciplina | Equipe EventHub | Concluído |
| T025 | Implantar a API usando Docker na EC2 | Arquitetura | Equipe EventHub | Concluído |
| T026 | Conferir evidências dos testes de CRUD no repositório | Evidências | Equipe EventHub | Pendente |
| T027 | Conferir a entrega do vídeo e os registros da Aula 3 | Entrega intermediária | Equipe EventHub | A confirmar |

## 5. Aula 4 — Armazenamento, processamento e relatórios

| ID | Tarefa | Requisito associado | Responsável | Status |
|---|---|---|---|---|
| T028 | Implementar o upload de banners por URL pré-assinada | RF02 da disciplina | Equipe EventHub | Concluído |
| T029 | Associar os arquivos aos eventos no RDS | RF02 da disciplina | Equipe EventHub | Concluído |
| T030 | Configurar notificação S3 para acionar LambdaThumb | RF03 da disciplina | Equipe EventHub | Concluído |
| T031 | Processar e gerar miniaturas das imagens | RF03 da disciplina | Equipe EventHub | Concluído |
| T032 | Persistir a referência das miniaturas no RDS | RF03 da disciplina | Equipe EventHub | Concluído |
| T033 | Implementar relatório gerencial com JOIN e GROUP BY | RF04 da disciplina | Equipe EventHub | Concluído |
| T034 | Integrar LambdaRelatorio ao API Gateway | RF04 da disciplina | Equipe EventHub | Concluído |
| T035 | Integrar o frontend com a API e os relatórios | RF05 da disciplina | Equipe EventHub | Concluído |
| T036 | Verificar logs de execução das funções no CloudWatch | Evidências | Equipe EventHub | Pendente |
| T037 | Registrar capturas e resultados dos testes de integração | Evidências | Equipe EventHub | Pendente |

## 6. Funcionalidades complementares do EventHub

| ID | Tarefa | Requisito associado | Responsável | Status |
|---|---|---|---|---|
| T038 | Validar capacidade dos auditórios e participantes previstos | Regras de negócio | Equipe EventHub | Concluído |
| T039 | Bloquear conflitos de agendamento | Regras de negócio | Equipe EventHub | Concluído |
| T040 | Implementar consulta de auditórios disponíveis | Regras de negócio | Equipe EventHub | Concluído |
| T041 | Implementar bloqueios por manutenção e inatividade | Regras de negócio | Equipe EventHub | Concluído |
| T042 | Implementar controle de status dos eventos | Regras de negócio | Equipe EventHub | Concluído |
| T043 | Validar as oito funcionalidades de negócio do EventHub | RF01–RF08 do sistema | Equipe EventHub | Concluído |

## 7. Requisitos não funcionais

| ID | Tarefa | Requisito associado | Responsável | Status |
|---|---|---|---|---|
| T044 | Validar RDS privado, subnets e grupos autorizados | RNF01 | Equipe EventHub | Concluído |
| T045 | Revisar `.gitignore`, arquivos versionados e padrões de credenciais | RNF02 | Equipe EventHub | Concluído |
| T046 | Testar recuperação após reiniciar o Learner Lab | RNF03 | Equipe EventHub | Concluído |
| T047 | Automatizar a atualização do IP e publicação de `config.js` no S3 | RNF03 | Equipe EventHub | Concluído |
| T048 | Configurar o Docker para autenticação automática pelo LabRole | RNF03 | Equipe EventHub | Concluído |
| T049 | Testar a inicialização do novo Docker e a autenticação IAM | RNF03 | Equipe EventHub | Concluído |
| T050 | Elaborar o registro de decisão arquitetural ADR-001 | RNF04 | Equipe EventHub | Concluído |
| T051 | Documentar a infraestrutura configurada sem IaC | RNF05 | Equipe EventHub | Concluído |
| T052 | Revisar a reprodutibilidade da implantação a partir da documentação | RNF03 / RNF05 | Equipe EventHub | Em revisão |

## 8. Documentação e entrega final

| ID | Tarefa | Requisito associado | Responsável | Status |
|---|---|---|---|---|
| T053 | Revisar `README.md` e instruções de recuperação | Documentação | Equipe EventHub | Concluído |
| T054 | Atualizar `specs/design.md` e o diagrama de arquitetura | Documentação | Equipe EventHub | Concluído |
| T055 | Atualizar `specs/infra.md` | Documentação | Equipe EventHub | Concluído |
| T056 | Revisar `specs/spec.md` e requisitos de aceite | Documentação | Equipe EventHub | Em revisão |
| T057 | Revisar e complementar `docs/ia-log.md` | IA Log | Equipe EventHub | Pendente |
| T058 | Organizar capturas e evidências da AWS e do frontend | Evidências | Equipe EventHub | Pendente |
| T059 | Revisar possíveis informações sensíveis nos arquivos de entrega | RNF02 | Equipe EventHub | Pendente |
| T060 | Conferir todos os arquivos versionados no GitHub | Entrega final | Equipe EventHub | Pendente |
| T061 | Preparar e validar o arquivo ZIP do projeto | Entrega final | Equipe EventHub | Pendente |
| T062 | Entregar o ZIP e confirmar o link do repositório no Moodle | Entrega final | Equipe EventHub | Pendente |
