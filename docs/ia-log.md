# Registro de Interação com IA

## 2026-10-16

### Solicitação

Revisar `specs/spec.md` e verificar se ele respondia às perguntas: qual problema, para quem, quais histórias de usuário e como saber se cada história está pronta (critérios de aceite).

### Análise e alterações

- O spec já descrevia o problema, duas personas e cinco histórias, mas misturava critérios de aceite com detalhes técnicos de implementação AWS.
- Foi explicitado o público-alvo e o objetivo do sistema; os requisitos funcionais RF-01 a RF-05 foram separados dos critérios de aceite.
- As histórias US-01 a US-05 foram ajustadas com critérios verificáveis, incluindo conflito de horários, envio de banner, miniaturas, relatório de ocupação e acesso pela interface web.
- Foram registradas como decisões em aberto: identificação e permissões por perfil, formatos e tamanho de banners, dimensões/formato/recorte das miniaturas e filtro de período do relatório. Enquanto o período não for definido, o critério do relatório considera eventos com data até a data da consulta.

### Validação

A validação do arquivo `specs/spec.md` não apontou erros.

## 2026-10-24

### Solicitação

Iniciar a Fase 1 do front-end do Sistema de Gestão de Eventos e Auditórios Universitários, lendo o repositório e usando `specs/design.md` como fonte de verdade para a arquitetura AWS.

### Análise e alterações

- Foram lidos os arquivos existentes do repositório, incluindo as especificações, a API Flask e o schema SQL.
- Foi proposta a estrutura futura do front-end em `src/`, mantendo separadas as páginas, componentes, serviços, estado global, mocks e tipos.
- Foi criado `src/types/index.ts` com tipos de usuários, auditórios, eventos, disponibilidade, bloqueios, upload de banners, relatórios e contratos REST compatíveis com a API atual.
- Foi criado `src/mocks/db.ts` com dados mock de usuários, auditórios, eventos, bloqueios de manutenção e métricas de ocupação.
- Os DTOs REST refletem os campos snake_case existentes no backend; os modelos da interface usam camelCase. Campos ainda não implementados no backend, como status do auditório e banner, permanecem representados apenas no domínio da interface/mock.
- Não foram configurados Vite, dependências ou telas nesta fase, conforme o plano iterativo solicitado.

### Validação

- Os diagnósticos de `src/types/index.ts` e `src/mocks/db.ts` não apontaram erros.

