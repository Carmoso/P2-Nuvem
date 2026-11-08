# EventHub — Sistema de Gestão de Eventos e Auditórios

Projeto acadêmico desenvolvido para a disciplina de **Serviços em Nuvem**, utilizando recursos da **Amazon Web Services (AWS)** disponibilizados pelo **AWS Academy Learner Lab**.

## 1. Visão geral

O EventHub é uma aplicação web para gerenciamento de auditórios e eventos. Ela reúne cadastro de espaços, agendamentos, validação de disponibilidade, controle de manutenção, imagens dos eventos e relatórios gerenciais.

O projeto demonstra a integração entre computação, banco de dados relacional, armazenamento de objetos, processamento serverless e hospedagem web estática na AWS.

## 2. Arquitetura

| Serviço / tecnologia | Responsabilidade |
| --- | --- |
| **Amazon EC2** | Hospeda a API Flask em contêiner Docker, executada com Gunicorn. |
| **Amazon RDS for PostgreSQL** | Persiste dados de auditórios e eventos. |
| **Amazon S3** | Hospeda o frontend estático e armazena banners. |
| **AWS Lambda** | Processa imagens e gera o relatório gerencial. |
| **Amazon API Gateway** | Disponibiliza as rotas HTTP dos relatórios. |
| **Amazon VPC e Security Groups** | Organizam a comunicação e restringem acessos à rede. |
| **Amazon CloudWatch** | Disponibiliza registros de execução dos serviços compatíveis. |
| **HTML, CSS e JavaScript** | Implementam a interface web, que consome as APIs. |

**Fluxo principal:** navegador → site estático no S3 → API Flask na EC2 → PostgreSQL no RDS.

**Banners:** upload para o S3 usando URL pré-assinada → evento no bucket → função Lambda de processamento → atualização de dados relacionados no RDS.

**Relatórios:** navegador → API Gateway → `LambdaRelatorio` → consultas agregadas no RDS.

Consulte [`specs/design.md`](specs/design.md) e [`specs/infra.md`](specs/infra.md) para os detalhes técnicos e de infraestrutura.

## 3. Funcionalidades

- Gerenciar auditórios e eventos (cadastro, consulta, edição e exclusão).
- Verificar a capacidade dos auditórios ao cadastrar eventos.
- Impedir conflitos de agendamento e períodos inválidos.
- Consultar auditórios disponíveis para um intervalo informado.
- Controlar auditórios inativos e períodos de manutenção.
- Enviar banners de eventos ao Amazon S3 e processar imagens via Lambda.
- Consultar relatórios gerenciais de ocupação e utilização dos auditórios.
- Controlar os estados dos eventos: **agendado**, **cancelado** e **finalizado**, respeitando as regras de transição.

Os requisitos funcionais, regras de negócio e restrições são detalhados em [`specs/spec.md`](specs/spec.md).

## 4. Estrutura do repositório

| Caminho | Descrição |
| --- | --- |
| `app/` | Código da API Flask. |
| `frontend/` | Interface estática em HTML, CSS e JavaScript. |
| `lambdas/` | Código das funções AWS Lambda. |
| `database/` | Esquema PostgreSQL, migrações e consultas SQL. |
| `scripts/` | Automação de configuração do frontend. |
| `specs/` | Especificação, arquitetura, infraestrutura e tarefas. |
| `docs/` | Registros do desenvolvimento e evidências. |
| `Dockerfile` | Definição da imagem da API. |
| `requirements.txt` | Dependências Python. |

## 5. Segurança e requisitos não funcionais

- **RNF-01 — Banco privado:** o RDS não possui acesso público. Suas duas subnets usam tabela de rotas privada; a porta TCP `5432` está liberada para os grupos de segurança da EC2 e das funções Lambda, não para toda a internet.
- **RNF-02 — Credenciais:** arquivos locais como `.env`, `.aws/credentials`, `frontend/config.js`, chaves `.pem` e backups temporários são ignorados pelo Git. A inspeção inicial dos arquivos versionados e do histórico não encontrou os padrões pesquisados de credenciais; isso não equivale a uma auditoria exaustiva.
- **RNF-03 — Recuperação:** o contêiner principal possui política Docker `unless-stopped` e o endereço da API é gerado e publicado no S3 por um serviço systemd após a inicialização da EC2.
- **RNF-04 — Decisões arquiteturais:** a justificativa para manter o CRUD em Flask/Docker na EC2 e usar Lambda em tarefas específicas deve constar em `specs/design.md`.
- **RNF-05 — Sem IaC:** a infraestrutura foi configurada conforme as permissões do Learner Lab, sem uso de ferramentas de infraestrutura como código.

**Limitação acadêmica:** partes da aplicação utilizam HTTP. Uma implantação de produção exigiria HTTPS, revisão de CORS, gestão de segredos, controles de autenticação/autorização e demais medidas de segurança.

## 6. Recuperação do ambiente no Learner Lab

Este procedimento cobre **a retomada dos recursos já criados**, caso a sessão do laboratório termine ou o endereço público da EC2 mude. Ele **não substitui** as instruções de recriação completa da infraestrutura, que devem ser registradas em [`specs/infra.md`](specs/infra.md).

### 6.1. Reativar e acessar os recursos

1. Inicie uma nova sessão do **AWS Academy Learner Lab** e abra o console AWS na região **`us-east-1`**.
2. Verifique se a EC2 do EventHub está em execução e se a instância RDS `eventos-db` está disponível.
3. Conecte-se à EC2 pelo método permitido pelo laboratório (por exemplo, EC2 Instance Connect).
4. Entre no projeto:

```bash
cd ~/P2-Nuvem
```

Confira o estado do repositório antes de atualizar qualquer arquivo:

```bash
git status --short
```

Se precisar recuperar mudanças já enviadas ao GitHub, utilize `git pull origin main` somente depois de revisar possíveis alterações locais, para não sobrescrevê-las.

### 6.2. Verificar o contêiner da API

A aplicação principal usa o contêiner **`eventhub-api`**, com política de reinício **`unless-stopped`**.

```bash
sudo docker ps -a
```

Se necessário, inicie-o:

```bash
sudo docker start eventhub-api
```

Confira seus registros sem imprimir variáveis ou credenciais:

```bash
sudo docker logs --tail 30 eventhub-api
```

O arquivo local de configuração da aplicação fica em **`/etc/eventhub/app.env`**. Ele contém informações sensíveis e **não deve ser copiado para o repositório nem exibido em capturas de tela**.

### 6.2.1. Autenticação automática do Docker via IAM

A EC2 possui o perfil **`LabInstanceProfile`**, com a role **`LabRole`**. O contêiner principal foi substituído por uma configuração que utiliza as credenciais temporárias obtidas automaticamente pelo **IMDSv2**. Não é mais necessário montar o diretório `~/.aws` no contêiner nem renovar as credenciais do usuário para as operações AWS do backend.

A instância exige IMDSv2 e está configurada com limite de saltos HTTP `2`, adequado ao acesso pelo contêiner Docker neste ambiente. Para conferir o método de autenticação sem exibir informações sensíveis:

```bash
sudo docker exec eventhub-api python -c 'import boto3; c=boto3.Session().get_credentials(); print("Metodo:", c.method if c else "Nenhum")'
```

O resultado esperado é `Metodo: iam-role`.

**Somente se o contêiner precisar ser recriado** e **não houver um contêiner com o nome `eventhub-api`**, utilize a imagem Docker já disponível na EC2 e o arquivo local de ambiente:

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

Esse comando **não** deve ser executado enquanto a aplicação principal já estiver em execução; não remova o contêiner atual para testar a documentação. A reconstrução completa da imagem e da infraestrutura precisa ser descrita também em `specs/infra.md`.

**Testes realizados em 08/11/2026:** API com resposta HTTP 200, autenticação `iam-role`, operações `PutObject`, `GetObject` e `DeleteObject` no S3 e visualização de um banner existente com resposta HTTP 200. O contêiner antigo foi preservado como backup (`eventhub-api-pre-iam`). Ainda não foi realizado um novo teste de reinício **após** a troca definitiva do contêiner.

### 6.3. Atualizar o endereço da API e publicá-lo automaticamente

O IP público da EC2 pode mudar entre sessões. Por esse motivo, o frontend carrega `config.js` antes de `script.js`, e o primeiro arquivo **não é versionado**. O repositório inclui apenas `frontend/config.example.js`.

A instância possui o perfil **`LabInstanceProfile`**, com a role **`LabRole`**, associado à EC2. O serviço **`eventhub-config.service`** é habilitado no systemd e executa o script [`scripts/gerar-config-frontend.sh`](scripts/gerar-config-frontend.sh), que:

1. Obtém o IP público corrente utilizando o **IMDSv2** da EC2.
2. Cria `frontend/config.js`, com o endereço `http://IP_PUBLICO_ATUAL:5000`.
3. Usa as credenciais automáticas do **perfil IAM da instância**, sem depender das credenciais locais do usuário.
4. Publica o arquivo no bucket S3 do frontend com `Cache-Control: no-cache`.

**Bucket do frontend:** `p2-nuvem-eventhub-475858528651-2026`.

Verifique a habilitação do serviço:

```bash
sudo systemctl is-enabled eventhub-config.service
```

Consulte o resultado e os registros:

```bash
sudo systemctl show eventhub-config.service -p Result -p ExecMainStatus
sudo journalctl -u eventhub-config.service -n 20 --no-pager
```

O status `inactive (dead)` pode ser normal para um serviço **`oneshot`** depois de uma execução bem-sucedida. Busque `Result=success` e `ExecMainStatus=0`.

Se precisar executar a atualização novamente:

```bash
sudo systemctl start eventhub-config.service
```

**Validação em 08/11/2026:** após encerrar e reiniciar o Learner Lab, a EC2 iniciou o contêiner então existente, detectou a mudança do IP público de `54.145.57.79` para `54.242.30.184` e publicou automaticamente o novo `config.js` no S3. O arquivo público foi comparado com o gerado na EC2, e as rotas de auditórios e eventos responderam com HTTP 200. Esse teste ocorreu **antes** da troca definitiva do contêiner para autenticação `iam-role`; o reinício dessa nova versão ainda deve ser validado.

### 6.4. Validar o frontend publicado

Acesse o site estático:

`http://p2-nuvem-eventhub-475858528651-2026.s3-website-us-east-1.amazonaws.com`

Para conferir que o `config.js` publicado é igual ao arquivo da EC2, execute:

```bash
cd ~/P2-Nuvem
TEMP=$(mktemp)
if curl -fsS --max-time 15 \
  "http://p2-nuvem-eventhub-475858528651-2026.s3-website-us-east-1.amazonaws.com/config.js" \
  -o "$TEMP"; then
  cmp -s frontend/config.js "$TEMP" \
    && echo "Configuração publicada corretamente" \
    || echo "Configuração diferente: verificar publicação ou cache"
else
  echo "Não foi possível consultar o config.js público"
fi
rm -f "$TEMP"
```

Atualize o navegador com **Ctrl + Shift + R** se uma versão antiga estiver em cache.

### 6.5. Credenciais temporárias do laboratório

O script de publicação do frontend **e o contêiner principal `eventhub-api`** utilizam as credenciais temporárias automáticas do perfil IAM da EC2 (`LabRole`). Portanto, **não exigem renovação manual das credenciais locais para acessar os serviços AWS testados**.

Comandos da AWS CLI executados manualmente no usuário `ubuntu` ainda podem priorizar credenciais antigas em `~/.aws/credentials` e apresentar erros como `UnauthorizedOperation` ou `ExpiredToken`. Para consultar serviços com o perfil da instância, use explicitamente o mecanismo de autenticação por IAM role; se precisar das credenciais próprias da sessão, renove-as pelo procedimento oficial do Learner Lab. Isso **não** exige alterar o contêiner principal.

A associação do perfil IAM é uma configuração da infraestrutura AWS, não do código-fonte; confira sua presença ao recriar a EC2 ou o ambiente de laboratório.

Nunca publique chaves de acesso, chaves secretas, tokens de sessão ou senhas no GitHub, em logs compartilhados ou em capturas de tela.

### 6.6. Lista de verificação após a recuperação

- [ ] EC2 e RDS disponíveis.
- [ ] Contêiner `eventhub-api` em execução.
- [ ] `boto3` no contêiner reporta `Metodo: iam-role`.
- [ ] API Flask responde no endereço público atual da EC2, porta `5000`.
- [ ] Serviço `eventhub-config.service` executou com sucesso.
- [ ] `config.js` publicado no site S3 contém o endereço da API da sessão atual.
- [ ] Frontend lista auditórios e eventos corretamente.
- [ ] Consulta de disponibilidade e regras de agendamento funcionam.
- [ ] Relatório via API Gateway responde corretamente.
- [ ] Upload/processamento de banners continua funcional.

## 7. Endpoints de referência

### API Flask na EC2

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/auditorios` | Listagem de auditórios. |
| `POST` | `/auditorios` | Cadastro de auditório. |
| `PUT` | `/auditorios/{id}` | Atualização de auditório. |
| `DELETE` | `/auditorios/{id}` | Exclusão de auditório. |
| `GET` | `/auditorios/disponiveis` | Consulta de disponibilidade. |
| `GET` | `/eventos` | Listagem de eventos. |
| `POST` | `/eventos` | Cadastro de evento. |
| `PUT` | `/eventos/{id}` | Atualização de evento. |
| `DELETE` | `/eventos/{id}` | Exclusão de evento. |

O endereço-base da API Flask é obtido dinamicamente de `frontend/config.js`, não de um IP salvo no repositório.

### Relatório via API Gateway

Endpoint HTTP de referência:

`https://10ciu9d8h0.execute-api.us-east-1.amazonaws.com/relatorios/ocupacao`

O relatório usa `LambdaRelatorio` para consultar e agregar dados do PostgreSQL. A aplicação também preserva a rota anterior `/relatorios/auditorios`.

## 8. Documentação complementar

- [`specs/spec.md`](specs/spec.md) — especificação funcional e restrições.
- [`specs/design.md`](specs/design.md) — arquitetura e decisões técnicas.
- [`specs/infra.md`](specs/infra.md) — infraestrutura AWS e procedimentos de configuração.
- [`specs/tasks.md`](specs/tasks.md) — tarefas e acompanhamento do trabalho.
- [`docs/ia-log.md`](docs/ia-log.md) — registro do uso de inteligência artificial.
- [`database/schema.sql`](database/schema.sql) — esquema inicial PostgreSQL.
- [`database/migrations/`](database/migrations/) — evoluções do banco de dados.

## 9. Repositório

https://github.com/Carmoso/P2-Nuvem
