# Especificação do Sistema (Spec)

## Domínio: Sistema de Gestão de Eventos e Auditórios

## 1. Problema
A faculdade possui diversos auditórios e espaços de eventos que são agendados por diferentes coordenadores e alunos organizadores. O processo atual carece de centralização, o que gera choques de horários, dificuldade para consultar a ocupação dos espaços e falta de padronização na divulgação visual dos eventos (banners).

## 2. Personas
* **Organizador (Aluno/Professor):** Precisa reservar espaços físicos para palestras, workshops ou defesas, além de divulgar o evento anexando o material visual.
* **Administrador (Infraestrutura/Coordenação):** Gerencia os espaços disponíveis, precisa garantir que não haja conflitos e analisa relatórios de uso (ocupação) para tomada de decisão.

## 3. Histórias de Usuário e Critérios de Aceite

| ID | Requisito Relacionado | História de Usuário | Critérios de Aceite |
|----|-----------------------|---------------------|---------------------|
| US-01 | **[RF-01]** | Como *Organizador*, quero cadastrar, listar, editar e excluir meus eventos vinculando-os a um auditório disponível. | - O sistema deve persistir as entidades `Evento` e `Auditorio` no RDS.<br>- Não deve permitir o cadastro de dois eventos no mesmo `auditorio_id` na mesma data e horário. |
| US-02 | **[RF-02]** | Como *Organizador*, quero fazer upload do banner promocional do evento. | - O backend deve gerar uma URL pré-assinada.<br>- O front-end usa a URL para enviar a imagem direto para o bucket S3.<br>- O caminho da imagem deve ser salvo no RDS vinculado ao evento. |
| US-03 | **[RF-03]** | Como *Sistema*, quero gerar miniaturas automáticas dos banners para otimizar o carregamento da listagem. | - A chegada de um novo arquivo no S3 deve engatilhar uma função Lambda.<br>- A Lambda deve criar a miniatura, salvar em um diretório/bucket separado no S3 e atualizar a coluna `thumbnail_url` no RDS. |
| US-04 | **[RF-04]** | Como *Administrador*, quero um relatório analítico para saber quantos eventos ocorreram por auditório. | - A rota `GET /relatorios/ocupacao` (API Gateway) deve chamar uma Lambda.<br>- A Lambda executa uma query de agregação (`JOIN` com `GROUP BY` e `COUNT`) no RDS e retorna o JSON com o consolidado. |
| US-05 | **[RF-05]** | Como *Usuário*, quero acessar a plataforma pelo navegador de qualquer lugar. | - O front-end (HTML/JS) deve ser publicado como site estático no S3.<br>- Deve consumir a API hospedada na EC2 e Lambdas.<br>- As regras de CORS devem estar configuradas no API Gateway e no S3. |
