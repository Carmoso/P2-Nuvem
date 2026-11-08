# Infraestrutura AWS — EventHub

## 1. Visão geral

O EventHub — Sistema de Gestão de Eventos e Auditórios — foi implementado na região `us-east-1` (Norte da Virgínia), utilizando os recursos disponibilizados pelo AWS Academy Learner Lab.

A solução adota uma arquitetura híbrida, combinando uma API REST executada em Docker na Amazon EC2 com funções AWS Lambda para processamento de imagens e geração de relatórios.

A infraestrutura foi configurada diretamente nos serviços AWS, sem utilização de Terraform, CloudFormation, AWS CDK ou outras ferramentas de infraestrutura como código (IaC).

O diagrama da arquitetura está disponível em `specs/design.md`.

## 2. Serviços utilizados

| Serviço | Responsabilidade |
|---|---|
| Amazon EC2 | Hospedagem da API principal |
| Docker | Execução e isolamento da aplicação Flask |
| Amazon RDS PostgreSQL | Armazenamento dos dados |
| Amazon S3 | Hospedagem do frontend e armazenamento de imagens |
| AWS Lambda | Processamento de miniaturas e relatórios |
| Amazon API Gateway | Disponibilização do endpoint de relatórios |
| Amazon VPC | Organização e isolamento da rede |
| Security Groups | Controle do tráfego permitido |
| IAM | Permissões de acesso aos serviços AWS |
| Amazon CloudWatch | Registros de execução dos serviços |

## 3. Rede e segurança

### 3.1. VPC

A infraestrutura utiliza a VPC:

`vpc-07b3b25da04eb6d34`

A instância EC2 hospeda a API e recebe requisições HTTP na porta 5000.

O banco RDS está associado a duas subnets privadas:

- `subnet-0b94b98a1e9355604`
- `subnet-02fa0f2a44d6d07b9`

As subnets privadas utilizam uma tabela de rotas que não possui rota direta para um Internet Gateway.

A VPC também possui um Gateway VPC Endpoint para acesso ao Amazon S3, identificado como:

`vpce-0d0897eba4db4404f`

### 3.2. Security Groups

A infraestrutura utiliza os seguintes grupos:

| Nome | Identificador | Finalidade |
|---|---|---|
| `ec2-eventos` | `sg-000894d99e628ecf7` | Comunicação da instância EC2 |
| `lambda-eventos` | `sg-0091f415927963c91` | Comunicação das funções Lambda |
| `sgrds-eventos` | `sg-0e1bdcf57a713eb5f` | Proteção do RDS PostgreSQL |

O Security Group do RDS permite conexões de entrada na porta TCP 5432 somente a partir dos grupos `ec2-eventos` e `lambda-eventos`.

Não existe regra de entrada liberando a porta PostgreSQL para qualquer endereço IPv4 ou IPv6.

A instância EC2 e as funções `LambdaThumb` e `LambdaRelatorio` foram verificadas utilizando os Security Groups correspondentes.

## 4. Amazon EC2 e Docker

### 4.1. Instância

- Nome: `ec2-projeto-eventos`
- Identificador: `i-03d9ce6305a55d363`
- Sistema operacional: Ubuntu
- Aplicação: Python, Flask e Gunicorn
- Contêiner principal: `eventhub-api`
- Porta da API: TCP 5000
- Política de reinício: `unless-stopped`

A aplicação implementa o gerenciamento de auditórios e eventos, validações de capacidade, conflitos de agendamento, disponibilidade, manutenção, status e integração com imagens armazenadas no S3.

### 4.2. Configuração do contêiner

O contêiner principal utiliza a imagem Docker:

`eventhub-api:rf08-status`

A configuração do banco é fornecida por meio do arquivo local:

`/etc/eventhub/app.env`

Esse arquivo contém informações sensíveis e não deve ser enviado ao repositório.

O contêiner utiliza o `LabRole` por meio do perfil IAM da instância, sem montar o diretório de credenciais AWS do usuário.

A configuração testada para recriação do contêiner é:

```bash
sudo docker run -d \
  --name eventhub-api \
  --restart unless-stopped \
  --env-file /etc/eventhub/app.env \
  -e AWS_SHARED_CREDENTIALS_FILE=/dev/null \
  -e AWS_CONFIG_FILE=/dev/null \
  -e AWS_EC2_METADATA_DISABLED=false \
  -p 5000:5000 \
  eventhub-api:rf08-status
```

Esse comando pressupõe que a imagem já esteja disponível e que não exista outro contêiner com o nome `eventhub-api`. A imagem pode precisar ser reconstruída a partir do `Dockerfile` em uma instalação nova.

### 4.3. Autenticação AWS

A EC2 utiliza o perfil:

`LabInstanceProfile`

Esse perfil contém a role:

`LabRole`

A instância está configurada com IMDSv2 obrigatório e limite de dois saltos, permitindo que o Docker obtenha credenciais temporárias automaticamente.

Foram realizados testes de autenticação, consulta ao S3, upload, leitura, exclusão e visualização de banners utilizando esse mecanismo.

## 5. Amazon RDS PostgreSQL

- Identificador: `eventos-db`
- Banco: PostgreSQL
- Versão registrada: 18.3
- Classe registrada: `db.t4g.micro`
- Armazenamento registrado: 20 GiB
- Grupo de subnets: `db-subnet-group-eventos`
- Acesso público: desabilitado

As principais tabelas do sistema são `auditorios` e `eventos`, relacionadas por `eventos.auditorio_id`.

O arquivo `database/schema.sql` registra a estrutura inicial do banco.

As alterações posteriores estão documentadas em `database/migrations/`.

A estrutura utiliza chaves primárias, relacionamento entre entidades e campos necessários para disponibilidade, manutenção, status e imagens dos eventos.

O banco é acessado somente pelos recursos autorizados da infraestrutura.

## 6. Amazon S3

### 6.1. Frontend estático

Bucket:

`p2-nuvem-eventhub-475858528651-2026`

Responsável pela hospedagem dos arquivos HTML, CSS e JavaScript.

Endereço do site:

http://p2-nuvem-eventhub-475858528651-2026.s3-website-us-east-1.amazonaws.com

O frontend utiliza o arquivo `config.js` para identificar o endereço atual da API.

Esse arquivo é gerado automaticamente na EC2 e publicado no bucket S3.

### 6.2. Banners e miniaturas

Bucket:

`p2-nuvem-eventhub-banners-475858528651-2026`

Armazena as imagens associadas aos eventos e as miniaturas processadas.

O backend pode gerar URLs pré-assinadas para o envio e a visualização de imagens.

O bucket possui uma notificação de criação de objetos com o prefixo `uploads/`, responsável por acionar a função `LambdaThumb`.

Esse filtro evita que a função seja acionada para todos os objetos criados no bucket.

## 7. AWS Lambda

### 7.1. LambdaThumb

Função responsável por processar imagens enviadas ao bucket de banners.

Fluxo:

1. Um objeto é criado no S3 com o prefixo `uploads/`.
2. A notificação do bucket aciona a Lambda.
3. A função processa a imagem e produz uma miniatura.
4. A miniatura é armazenada no S3.
5. O banco PostgreSQL é atualizado com a referência da imagem processada.

A função está conectada à VPC para acessar o RDS privado.

### 7.2. LambdaRelatorio

Função responsável pela geração do relatório gerencial de utilização dos auditórios.

Executa consultas ao PostgreSQL, utilizando operações de agregação e relacionamento entre tabelas.

A função está integrada ao Amazon API Gateway e conectada à VPC.

## 8. Amazon API Gateway

A API de relatórios utiliza o Amazon API Gateway, com a rota:

`GET /relatorios/ocupacao`

Endpoint:

https://10ciu9d8h0.execute-api.us-east-1.amazonaws.com/relatorios/ocupacao

A requisição aciona a função `LambdaRelatorio`, que consulta o PostgreSQL e retorna informações consolidadas.

O endpoint foi testado com resposta HTTP 200.

## 9. Recuperação automática do ambiente

O projeto utiliza o script:

`scripts/gerar-config-frontend.sh`

O script é executado pelo serviço systemd:

`eventhub-config.service`

Durante a inicialização da EC2, o serviço:

1. Consulta o IP público atual usando IMDSv2.
2. Gera o arquivo `frontend/config.js`.
3. Obtém credenciais automaticamente pelo perfil IAM.
4. Publica o arquivo no bucket S3 do frontend.

O serviço foi testado após encerrar e reiniciar o Learner Lab.

Durante o teste, o IP público da EC2 mudou, mas a configuração foi atualizada automaticamente no S3.

Posteriormente, o contêiner principal também foi configurado para utilizar `LabRole` e testado após reinicialização da EC2.

O Docker iniciou automaticamente, a API respondeu com HTTP 200 e o serviço de atualização do frontend foi executado com sucesso.

O procedimento de recuperação está detalhado no `README.md`.

## 10. Infraestrutura sem IaC — RNF-05

Os recursos foram criados e configurados diretamente no ambiente AWS Academy Learner Lab.

Não foram utilizadas ferramentas de provisionamento como Terraform, CloudFormation ou AWS CDK.

A verificação dos arquivos versionados não identificou artefatos típicos dessas ferramentas.

Os scripts presentes no repositório são utilizados para configuração e operação da aplicação, não para provisionamento declarativo da infraestrutura AWS.

A recriação de um ambiente excluído exige configurar novamente a VPC, as subnets, os Security Groups, a EC2, o perfil IAM, o RDS, os buckets S3, as funções Lambda, os gatilhos de eventos e o API Gateway, respeitando as relações descritas neste documento e no diagrama de arquitetura.

## 11. Limitações

A implementação utiliza recursos do Learner Lab e está sujeita às permissões e à duração das sessões do laboratório.

A solução não implementa alta disponibilidade ou escalabilidade automática da API principal.

A API EC2 e o site estático utilizam HTTP. Para utilização em produção, recomenda-se configurar HTTPS, controles de acesso mais abrangentes, monitoramento e estratégias de recuperação apropriadas.

A infraestrutura existente pode ser retomada conforme o README. A recriação completa de recursos excluídos requer configurações adicionais dos serviços AWS.

## 12. Documentação relacionada

- `README.md` — apresentação e recuperação do ambiente.
- `specs/design.md` — arquitetura e diagrama.
- `specs/spec.md` — requisitos.
- `specs/tasks.md` — tarefas do projeto.
- `docs/adr-001-crud-ec2-vs-lambda.md` — decisão arquitetural.
- `docs/ia-log.md` — registro de uso de IA.
- `database/schema.sql` — estrutura inicial do PostgreSQL.
- `database/migrations/` — migrações do banco.
