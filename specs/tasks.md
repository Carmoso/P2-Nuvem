# Acompanhamento das tarefas — Projeto 2

## Entrega de 23/10/2026

### Infraestrutura AWS
- [x] Criar sub-redes privadas para o RDS.
- [x] Configurar tabela de rotas privada sem rota para Internet Gateway.
- [x] Criar o grupo de sub-redes do RDS.
- [x] Criar instância PostgreSQL no Amazon RDS.
- [x] Configurar grupos de segurança para a EC2 e o RDS.
- [x] Registrar e documentar as regras dos grupos de segurança.
- [x] Confirmar e registrar que o RDS não permite acesso público.

### Banco de dados
- [x] Criar tabela `auditorios`.
- [x] Criar tabela `eventos`.
- [x] Criar chave estrangeira entre eventos e auditórios.
- [x] Versionar o script SQL de criação do esquema.

### API e persistência
- [x] Configurar a conexão da API Flask com o PostgreSQL.
- [x] Implementar CRUD de auditórios.
- [x] Implementar CRUD de eventos.
- [x] Implementar consulta de eventos com JOIN entre as tabelas.
- [x] Testar operações de cadastro, consulta, atualização e exclusão.

### Documentação e entrega
- [ ] Revisar e atualizar este checklist.
- [ ] Atualizar a documentação da arquitetura e da infraestrutura.
- [ ] Conferir os arquivos no repositório GitHub.
- [ ] Gravar vídeo demonstrativo de até 5 minutos.
- [ ] Enviar o vídeo no Moodle e conferir o link do repositório.

## Próxima etapa — entrega de 30/10/2026
- [ ] Implementar upload de arquivos para o Amazon S3 usando URL pré-assinada.
- [ ] Implementar processamento de objetos S3 por AWS Lambda.
- [ ] Implementar relatório usando API Gateway, Lambda e consultas SQL.
- [ ] Publicar o frontend e integrá-lo à API.

