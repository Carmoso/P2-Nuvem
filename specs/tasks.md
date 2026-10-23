# Acompanhamento das tarefas — Projeto 2 de Computação em Nuvem

## Aula 1 — 09/10/2026

### Organização e especificação
- [x] Confirmar a formação do grupo.
- [x] Criar o repositório GitHub do projeto.
- [x] Confirmar o acesso do professor ao repositório.
- [x] Definir o domínio: sistema de gestão de eventos e auditórios.
- [x] Elaborar a especificação inicial do problema, das personas e dos requisitos funcionais.
- [x] Confirmar que existem pelo menos cinco histórias de usuário e que cada requisito funcional está relacionado a elas.
- [x] Registrar a primeira interação com IA em `ia-log.md`.
- [x] Confirmar o envio do link do repositório no Moodle.

## Aula 2 — 16/10/2026

### Especificação e arquitetura
- [x] Revisar o `spec.md` e conferir os critérios de aceite de todas as histórias.
- [x] Elaborar o diagrama de arquitetura em `design.md`.
- [x] Conferir se o modelo ER está documentado em `design.md`.
- [x] Conferir se as rotas da API estão documentadas em `design.md`.
- [x] Criar e documentar o ADR referente ao RNF-04.
- [x] Conferir se o diagrama e a documentação correspondem à arquitetura implementada.

### Protótipo web
- [x] Criar um bucket S3 para hospedar a landing page ou o protótipo.
- [x] Publicar a landing page ou o protótipo no S3.
- [x] Confirmar que a página está acessível pela internet.
- [x] Registrar o endereço público do protótipo na documentação.

## Aula 3 — 23/10/2026

### Infraestrutura AWS
- [x] Utilizar uma VPC com sub-redes públicas e privadas.
- [x] Criar duas sub-redes privadas para o RDS.
- [x] Associar as sub-redes privadas a uma tabela de rotas sem rota para o Internet Gateway.
- [x] Criar o grupo de sub-redes do RDS.
- [x] Criar a instância PostgreSQL no Amazon RDS.
- [x] Confirmar que o RDS não permite acesso público (`PubliclyAccessible = False`).
- [x] Configurar os grupos de segurança da EC2 e do RDS.
- [x] Registrar as regras efetivas dos grupos de segurança em `specs/infra.md`.
- [x] Conferir se o grupo de segurança do RDS permite entrada na porta 5432 somente a partir do grupo da EC2.

### Banco de dados
- [x] Criar a tabela `auditorios`.
- [x] Criar a tabela `eventos`.
- [x] Criar a chave estrangeira de `eventos.auditorio_id` para `auditorios.id`.
- [x] Criar e versionar o script SQL em `database/schema.sql`.
- [x] Executar o script no RDS.
- [x] Confirmar a existência das tabelas no banco de dados.

### API e persistência
- [x] Implementar a API Flask em `app/main.py`.
- [x] Configurar a conexão da aplicação com o PostgreSQL usando variáveis de ambiente.
- [x] Implementar o cadastro, a consulta, a atualização e a exclusão de auditórios.
- [x] Implementar o cadastro, a consulta, a atualização e a exclusão de eventos.
- [x] Implementar a consulta de eventos com `JOIN` entre eventos e auditórios.
- [x] Testar as operações CRUD na EC2 conectada ao RDS.
- [x] Confirmar que os dados são persistidos no banco de dados.
- [x] Confirmar que todos os testes e evidências estão documentados no repositório.

### Documentação e entrega
- [x] Criar ou revisar o `.gitignore` para ignorar `.venv/`, `__pycache__/`, arquivos Python compilados e `.env`.
- [x] Revisar `specs/tasks.md` e manter o checklist atualizado.
- [x] Criar ou revisar `specs/infra.md` com a infraestrutura e as regras de segurança.
- [ ] Conferir se todos os arquivos necessários estão versionados no GitHub.
- [ ] Fazer commit e push das alterações finais.
- [ ] Gravar um vídeo de até cinco minutos demonstrando a infraestrutura e o CRUD funcionando na AWS.
- [ ] Enviar o vídeo no Moodle.
- [ ] Confirmar que o link do repositório atualizado foi entregue.

## Próxima etapa — Aula 4, 30/10/2026

### Upload e processamento de arquivos
- [ ] Implementar upload de arquivos para o Amazon S3 por URL pré-assinada.
- [ ] Associar o arquivo enviado à entidade correspondente.
- [ ] Configurar um evento do S3 para acionar uma função AWS Lambda.
- [ ] Processar o arquivo na Lambda e gerar um resultado útil, como uma miniatura.
- [ ] Persistir o resultado do processamento no RDS.
- [ ] Conferir os registros de execução no CloudWatch.

### Relatório e frontend
- [ ] Implementar o relatório por API Gateway e AWS Lambda.
- [ ] Utilizar consultas SQL com `JOIN` e `GROUP BY` no relatório.
- [ ] Publicar o frontend.
- [ ] Integrar o frontend com a API.
- [ ] Testar o fluxo completo da aplicação publicada.
- [ ] Atualizar a documentação para refletir a arquitetura implementada.

## Entrega final — 06/11/2026
- [ ] Revisar os requisitos funcionais e não funcionais do projeto.
- [ ] Conferir a documentação e os diagramas.
- [ ] Validar o funcionamento integrado dos componentes AWS.
- [ ] Preparar o arquivo ZIP conforme as orientações do professor.
- [ ] Entregar o ZIP no prazo estabelecido.
