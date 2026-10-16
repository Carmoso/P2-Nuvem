# Especificação do Sistema (Spec)

## Domínio: Sistema de Gestão de Eventos e Auditórios

## 1. Problema
A faculdade possui diversos auditórios e espaços de eventos que são agendados por diferentes coordenadores e alunos organizadores. Sem um processo centralizado, ocorrem conflitos de horário, é difícil consultar a ocupação dos espaços e falta padronização na divulgação visual dos eventos (banners). O sistema deve centralizar o cadastro e a consulta de eventos, evitar reservas conflitantes, apoiar a divulgação dos eventos e fornecer dados de ocupação para a administração.

## 2. Personas
* **Organizador (Aluno/Professor):** Precisa cadastrar e acompanhar seus eventos, reservar espaços físicos para palestras, workshops ou defesas e divulgar o evento anexando o material visual.
* **Administrador (Infraestrutura/Coordenação):** Gerencia os espaços disponíveis e consulta relatórios de uso (ocupação) para apoiar decisões sobre os auditórios.

O público-alvo são os organizadores que agendam eventos na faculdade e os administradores responsáveis pela infraestrutura e pela coordenação dos espaços.

## 3. Requisitos Funcionais

* **RF-01:** Permitir cadastrar, consultar, editar e excluir eventos associados a auditórios. Persistir `Evento` e `Auditorio` no RDS e impedir eventos com horários conflitantes no mesmo auditório.
* **RF-02:** Permitir o envio do banner do evento ao S3 usando uma URL pré-assinada gerada pelo backend e persistir no RDS o caminho associado ao evento.
* **RF-03:** Gerar uma miniatura para banners enviados ao S3 por meio de uma Lambda acionada pelo upload, armazená-la no S3 e atualizar `thumbnail_url` no RDS.
* **RF-04:** Disponibilizar `GET /relatorios/ocupacao` por API Gateway e Lambda, retornando a quantidade de eventos por auditório a partir de uma agregação no RDS.
* **RF-05:** Publicar o front-end como site estático no S3 e permitir que ele consuma a API hospedada na EC2 e as Lambdas, com CORS configurado.

## 4. Histórias de Usuário e Critérios de Aceite

| ID | Requisito Relacionado | História de Usuário | Critérios de Aceite |
|----|-----------------------|---------------------|---------------------|
| US-01 | **[RF-01]** | Como *Organizador*, quero cadastrar, consultar, editar e excluir meus eventos vinculando-os a um auditório disponível. | - **Dado** que informei os dados necessários de um evento e escolhi um auditório, **quando** salvo, **então** o evento é criado e aparece na minha lista.<br>- **Quando** consulto, edito ou excluo um evento meu, **então** a lista reflete a alteração ou remoção.<br>- **Dado** que já existe um evento no auditório escolhido, **quando** tento salvar outro evento cujo intervalo de horário se sobrepõe na mesma data, **então** o sistema rejeita a reserva e informa o conflito; eventos em horários adjacentes são permitidos. |
| US-02 | **[RF-02]** | Como *Organizador*, quero enviar um banner para divulgar meu evento. | - **Dado** um evento, **quando** solicito o envio do banner, **então** recebo uma URL pré-assinada e o navegador envia o arquivo ao S3 usando essa URL.<br>- **Quando** o envio termina com sucesso, **então** o banner fica associado ao evento e é exibido nos dados do evento.<br>- Se o envio falhar, **então** o sistema não indica o banner como enviado com sucesso. |
| US-03 | **[RF-03]** | Como *Organizador*, quero que uma miniatura do banner apareça na listagem para reconhecer meu evento sem carregar a imagem original. | - **Dado** um banner enviado com sucesso, **quando** o processamento terminar, **então** existe uma miniatura associada ao evento e a listagem a utiliza.<br>- O processamento não substitui nem remove o banner original. |
| US-04 | **[RF-04]** | Como *Administrador*, quero consultar quantos eventos ocorreram em cada auditório para analisar sua ocupação. | - **Quando** consulto o relatório de ocupação, **então** recebo uma linha por auditório com a quantidade de eventos ocorridos nele.<br>- Para um auditório sem eventos ocorridos, o relatório apresenta quantidade zero.<br>- As quantidades correspondem aos eventos cadastrados e já ocorridos até a data da consulta. |
| US-05 | **[RF-05]** | Como *Organizador ou Administrador*, quero acessar a plataforma pelo navegador para executar as tarefas do meu perfil sem estar no campus. | - **Quando** acesso o endereço publicado da aplicação em um navegador, **então** a interface é carregada.<br>- As telas da aplicação conseguem consultar a API pelo navegador sem falha de comunicação entre origens (CORS).<br>- As funcionalidades disponíveis para cada perfil podem ser usadas pela interface. |

## 5. Decisões em Aberto

* **US-01/US-05:** Definir como o sistema identifica o usuário e quais ações são permitidas para cada perfil, para tornar verificável o acesso a “meus eventos” e às funcionalidades de cada papel.
* **US-02:** Definir formatos de imagem aceitos e limite de tamanho do banner.
* **US-03:** Definir dimensões, formato e política de recorte da miniatura.
* **US-04:** Definir se o relatório terá filtro por período. Até essa definição, o critério considera todos os eventos com data até a data da consulta.
