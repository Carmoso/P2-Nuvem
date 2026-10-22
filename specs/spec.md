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
* **RF-05:** Permitir cadastrar, consultar, editar e desativar auditórios e espaços de eventos. Persistir `Auditorio` no RDS e registrar indisponibilidades e bloqueios por período para evitar conflitos de agendamento.
* **RF-06:** Permitir consultar a disponibilidade de auditórios por data e intervalo de horário, considerando conflitos de agendamento, capacidade e bloqueios previamente cadastrados.
* **RF-07:** Permitir cadastrar, consultar, editar e cancelar eventos associados a auditórios, persistindo `Evento` e `Auditorio` no RDS e impedindo eventos com horários conflitantes no mesmo auditório.
* **RF-08:** Permitir cancelar ou encerrar eventos e liberar o auditório no período correspondente, atualizando o status do evento para refletir sua indisponibilidade e evitar agendamentos conflitantes.

## 4. Histórias de Usuário e Critérios de Aceite

| ID | Requisito Relacionado | História de Usuário | Critérios de Aceite |
|----|-----------------------|---------------------|---------------------|
| US-01 | **[RF-07]** | Como *Organizador*, quero cadastrar, consultar, editar e excluir meus eventos vinculando-os a um auditório disponível. | - **Dado** que informei os dados necessários de um evento e selecionei um auditório disponível, **quando** confirmo o cadastro, **então** o sistema salva o evento e o associa ao auditório sem gerar conflito de horário. <br> - **Dado** que um evento já existe, **quando** realizo uma consulta, edição ou exclusão, **então** o sistema apresenta e atualiza as informações corretamente. |
| US-02 | **[RF-01]** | Como *Organizador*, quero enviar um banner para divulgar meu evento. | - **Dado** um evento cadastrado, **quando** solicito o envio do banner, **então** recebo uma URL pré-assinada e o arquivo é enviado ao S3 com o caminho persistido no RDS. |
| US-03 | **[RF-02]** | Como *Organizador*, quero que uma miniatura do banner apareça na listagem para reconhecer meu evento sem carregar a imagem original. | - **Dado** um banner enviado com sucesso, **quando** o upload for concluído, **então** o sistema gera e armazena a miniatura no S3 e atualiza `thumbnail_url` no RDS. |
| US-04 | **[RF-03]** | Como *Administrador*, quero consultar quantos eventos ocorreram em cada auditório para analisar sua ocupação. | - **Quando** consulto o relatório de ocupação, **então** o sistema retorna a quantidade de eventos por auditório a partir da agregação no RDS. |
| US-05 | **[RF-04]** | Como *Organizador ou Administrador*, quero acessar a plataforma pelo navegador para executar as tarefas do meu perfil sem estar no campus. | - **Quando** acesso o endereço público do front-end, **então** o sistema me permite consumir a API e as Lambdas com CORS configurado. |
| US-06 | **[RF-05]** | Como *Administrador*, quero cadastrar, consultar, editar e desativar auditórios, além de registrar bloqueios e indisponibilidades por período. | - **Dado** que informei os dados do auditório, **quando** confirmo o cadastro, **então** o sistema salva o local com status disponível para uso. <br> - **Dado** que um auditório possui bloqueio ou indisponibilidade, **quando** um novo agendamento for solicitado, **então** o sistema não deve permitir a reserva para esse período. |
| US-07 | **[RF-06]** | Como *Organizador ou Administrador*, quero consultar a disponibilidade de auditórios por data e intervalo de horário. | - **Dado** uma data, um horário e a capacidade desejada, **quando** consulto a disponibilidade, **então** o sistema retorna apenas os auditórios compatíveis e sem conflito. <br> - **Dado** que não há auditórios disponíveis, **quando** a consulta for realizada, **então** o sistema informa claramente que não existem opções para aquele período. |
| US-08 | **[RF-08]** | Como *Organizador ou Administrador*, quero cancelar ou encerrar um evento e liberar o auditório do período correspondente. | - **Dado** que um evento foi cadastrado, **quando** confirmo o cancelamento ou encerramento, **então** o sistema atualiza o status do evento e libera o auditório para novos agendamentos no período correspondente. |

## 5. Decisões em Aberto    

* **US-01/US-05:** Definir como o sistema identifica o usuário e quais ações são permitidas para cada perfil, para tornar verificável o acesso a “meus eventos” e às funcionalidades de cada perfil.
* **US-02:** Definir formatos de imagem aceitos e limite de tamanho do banner.
* **US-03:** Definir dimensões, formato e política de recorte da miniatura.
* **US-04:** Definir se o relatório terá filtro por período. Até essa definição, o critério considera todos os eventos com data até a data da consulta.
