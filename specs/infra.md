# Infraestrutura AWS

## Região

- Região AWS: `us-east-1` (Norte da Virgínia).
- Instância de aplicação: EC2 `ec2-projeto-eventos`.
- Banco de dados: Amazon RDS PostgreSQL `eventos-db`.

## Rede

- As sub-redes privadas do RDS são `172.31.96.0/20` e `172.31.112.0/20`.
- Ambas estão associadas à tabela de rotas privada, que não possui rota para o Internet Gateway.
- O RDS utiliza o grupo de sub-redes `db-subnet-group-eventos`.
- O atributo `PubliclyAccessible` do RDS foi consultado pelo AWS CLI e retornou `False`.

## Grupos de segurança

- **EC2 (`ec2-eventos`):** acesso SSH pela porta TCP 22 restrito ao IP autorizado e às regras necessárias para EC2 Instance Connect.
- **RDS (`sgrds-eventos`):** entrada PostgreSQL pela porta TCP 5432 permitida a partir do grupo de segurança da EC2.
- O banco não permite acesso público. A aplicação conecta-se ao PostgreSQL pelo endpoint do RDS usando a porta 5432.

## Banco de dados

- Mecanismo: PostgreSQL 18.3.
- Classe: `db.t4g.micro`.
- Armazenamento: 20 GiB.
- Tabelas: `auditorios` e `eventos`.
- Relacionamento: `eventos.auditorio_id` referencia `auditorios.id`.

## Aplicação

- API implementada em Python com Flask.
- Persistência realizada no PostgreSQL usando Psycopg.
- CRUD de auditórios e eventos testado.
- Consulta de eventos utiliza `JOIN` com a tabela de auditórios.
