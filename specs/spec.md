# Especificação do Sistema (Spec)

## Domínio: Sistema de Gestão de Eventos e Auditórios

## 1. Problema
A faculdade possui diversos auditórios e espaços de eventos que são agendados por diferentes coordenadores e alunos organizadores. Sem um processo centralizado, ocorrem conflitos de horário, é difícil acompanhar a ocupação dos espaços e a divulgação dos eventos fica dispersa.

## 2. Personas
* **Organizador (Aluno/Professor):** Precisa cadastrar e acompanhar seus eventos, reservar espaços físicos para palestras, workshops ou defesas e divulgar o evento anexando o material visual.
* **Administrador (Infraestrutura/Coordenação):** Gerencia os espaços disponíveis e consulta relatórios de uso (ocupação) para apoiar decisões sobre os auditórios.

O público-alvo são os organizadores que agendam eventos na faculdade e os administradores responsáveis pela infraestrutura e pela coordenação dos espaços.

## 3. Requisitos Funcionais

* **RF-01:** Permitir o envio do banner do evento ao S3 usando uma URL pré-assinada gerada pelo backend e persistir no RDS o caminho associado ao evento.
* **RF-02:** Gerar uma miniatura para banners enviados ao S3 por meio de uma Lambda acionada pelo upload, armazená-la no S3 e atualizar `thumbnail_url` no RDS.
* **RF-03:** Disponibilizar `GET /relatorios/ocupacao` por API Gateway e Lambda, retornando a quantidade de eventos por auditório a partir de uma agregação no RDS.
* **RF-04:** Publicar o front-end como site estático no S3 e permitir que ele consuma a API hospedada na EC2 e as Lambdas, com CORS configurado.
* **RF-05:** Permitir cadastrar, consultar, editar e desativar auditórios e espaços de eventos, registrando seus períodos de indisponibilidade e bloqueios de agenda no RDS.
* **RF-06:** Permitir consultar a disponibilidade dos auditórios por data e intervalo de horário, considerando a capacidade, os bloqueios cadastrados e os eventos existentes.
* **RF-07:** Permitir cadastrar, consultar e editar eventos vinculados a auditórios, persistindo os dados no RDS e validando a disponibilidade do auditório antes de confirmar o agendamento.
* **RF-08:** Permitir cancelar ou encerrar eventos, atualizando seus respectivos status no RDS e liberando os horários correspondentes na agenda do auditório, quando aplicável.

## 4. Histórias de Usuário e Critérios de Aceite

| ID | Requisito Relacionado | História de Usuário | Critérios de Aceite |
|----|-----------------------|---------------------|---------------------|
| US-01 | **[RF-07]** | Como *Organizador*, quero cadastrar, consultar e editar meus eventos vinculando-os a um auditório disponível. | - **Dado** que informei os dados necessários de um evento e selecionei um auditório disponível, **quando** confirmo o cadastro, **então** o sistema salva o evento e o associa ao auditório sem gerar conflito de horário.<br>- **Dado** que um evento já existe, **quando** realizo uma consulta ou edição, **então** o sistema apresenta e atualiza as informações corretamente, validando a disponibilidade do auditório antes de confirmar alterações que afetem a agenda. |
| US-02 | **[RF-01]** | Como *Organizador*, quero enviar um banner para divulgar meu evento. | - **Dado** um evento cadastrado, **quando** solicito o envio do banner, **então** o sistema gera uma URL pré-assinada, permite o envio do arquivo ao S3 e persiste o caminho associado ao evento no RDS. |
| US-03 | **[RF-02]** | Como *Organizador*, quero que uma miniatura do banner apareça na listagem para reconhecer meu evento sem carregar a imagem original. | - **Dado** um banner enviado com sucesso, **quando** o upload for concluído, **então** o sistema gera e armazena a miniatura no S3 e atualiza `thumbnail_url` no RDS. |
| US-04 | **[RF-03]** | Como *Administrador*, quero consultar quantos eventos ocorreram em cada auditório para analisar sua ocupação. | - **Quando** consulto o relatório de ocupação, **então** o sistema retorna a quantidade de eventos por auditório a partir de uma agregação dos dados armazenados no RDS, considerando os eventos com data até a data da consulta. |
| US-05 | **[RF-04]** | Como *Organizador ou Administrador*, quero acessar a plataforma pelo navegador para executar as tarefas do meu perfil remotamente. | - **Quando** acesso o endereço público do front-end publicado no S3, **então** o sistema apresenta a interface e permite consumir a API hospedada na EC2 e as funções Lambda, com CORS configurado para as origens autorizadas. |
| US-06 | **[RF-05]** | Como *Administrador*, quero cadastrar, consultar, editar e desativar auditórios, além de registrar bloqueios e indisponibilidades por período. | - **Dado** que informei os dados necessários do auditório, **quando** confirmo o cadastro, **então** o sistema salva suas informações e define seu status inicial como disponível para uso.<br>- **Dado** que preciso bloquear um auditório, **quando** informo e confirmo o período de indisponibilidade, **então** o sistema registra o bloqueio e o considera nas consultas de disponibilidade e nas validações de agendamento. |
| US-07 | **[RF-06]** | Como *Organizador ou Administrador*, quero consultar a disponibilidade de auditórios por data e intervalo de horário para identificar opções adequadas ao evento. | - **Dado** uma data, um intervalo de horário e a capacidade desejada, **quando** consulto a disponibilidade, **então** o sistema retorna apenas os auditórios compatíveis, sem conflitos com eventos ou bloqueios registrados.<br>- **Dado** que não existem auditórios disponíveis para os parâmetros informados, **quando** realizo a consulta, **então** o sistema informa claramente que não há opções disponíveis para aquele período. |
| US-08 | **[RF-08]** | Como *Organizador ou Administrador*, quero cancelar ou encerrar um evento para atualizar seu status e disponibilizar novamente o horário do auditório quando aplicável. | - **Dado** que um evento pode ser cancelado ou encerrado, **quando** confirmo a operação, **então** o sistema atualiza seu status no RDS e considera o horário correspondente disponível para novos agendamentos, respeitando as regras de bloqueio e o período de utilização do auditório. |

## 5. Decisões Consolidadas e Limitações Conhecidas

Durante o desenvolvimento do EventHub, algumas decisões inicialmente consideradas em aberto foram definidas e incorporadas à implementação. Outras permanecem como limitações ou possibilidades de evolução do sistema.

### 5.1. Decisões implementadas

- **US-01/US-07 — Validação de agendamentos:** O sistema verifica a disponibilidade dos auditórios antes de confirmar agendamentos, considerando a capacidade necessária, os eventos existentes e os períodos de bloqueio registrados.

- **US-06 — Gerenciamento dos auditórios:** Os auditórios possuem informações de identificação, capacidade, localização, recursos e situação de atividade. Também é possível registrar e excluir bloqueios de utilização por período.

- **US-06/US-07 — Conflitos e indisponibilidades:** A consulta de disponibilidade considera apenas auditórios ativos, com capacidade suficiente e sem conflitos com eventos não cancelados ou bloqueios existentes no intervalo solicitado.

- **US-01/US-08 — Status dos eventos:** Foram definidos os status `agendado`, `finalizado` e `cancelado`. A aplicação possui validações para controlar as alterações de status e evitar transições incompatíveis com as regras estabelecidas.

- **US-08 — Liberação de horários:** Eventos cancelados deixam de impedir novos agendamentos no período correspondente. Os eventos finalizados permanecem registrados no histórico e continuam sujeitos às regras de verificação de conflitos.

- **US-02/US-03 — Armazenamento de imagens:** Os banners são armazenados no Amazon S3, enquanto a geração das miniaturas é realizada por uma função AWS Lambda. As referências dos arquivos são associadas aos eventos no PostgreSQL.

- **US-05 — Acesso à aplicação:** O frontend foi publicado como site estático no Amazon S3, consumindo a API Flask hospedada na EC2 e o endpoint de relatórios disponibilizado pelo API Gateway.

### 5.2. Limitações e decisões pendentes

- **US-01/US-05 — Autenticação e perfis:** A identificação de usuários e o controle de permissões por perfil ainda não estão definidos como funcionalidades completas da aplicação. As personas representam os diferentes tipos de usuários previstos, mas não implicam a existência de autenticação e autorização implementadas.

- **US-02 — Restrições de banners:** Os limites formais de tamanho e os formatos aceitos devem ser documentados conforme as validações efetivamente disponíveis na aplicação.

- **US-03 — Padronização das miniaturas:** O processamento das imagens está implementado, mas as dimensões exatas e a política de recorte devem ser conferidas na configuração da função Lambda antes de serem estabelecidas como requisitos definitivos.

- **US-04 — Filtro do relatório:** O relatório gerencial apresenta a quantidade total de eventos por auditório, discriminando os eventos agendados, finalizados e cancelados. São considerados os eventos cuja data e hora de início sejam anteriores ou iguais ao momento da consulta, utilizando o horário UTC como referência. A implementação atual não possui filtros personalizados por período, que poderão ser adicionados futuramente.

### 5.3. Possibilidades de evolução

As limitações identificadas não impedem a demonstração das funcionalidades desenvolvidas no escopo atual do projeto. Entre as melhorias futuras estão a implementação de autenticação e autorização por perfil, a ampliação dos filtros gerenciais e o aperfeiçoamento das validações e configurações relacionadas às imagens.
