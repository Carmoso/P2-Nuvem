# Design e Arquitetura do Sistema (Design)

## 1. Diagrama de Arquitetura

```plantuml
@startuml
left to right direction
skinparam componentStyle rectangle
skinparam linetype ortho

actor "Usuário" as User

cloud "AWS" {
    node "Amazon S3\nFront-end estático" as S3Front
    node "Amazon S3\nBanners e miniaturas" as S3Banners

    node "Amazon API Gateway" as APIGW
    node "AWS Lambda\nGeração de miniaturas" as LambdaThumb
    node "AWS Lambda\nRelatório de ocupação" as LambdaReport

    frame "VPC" {
        frame "Subnet pública" {
            node "Amazon EC2\nAPI REST (Node.js/Python)" as EC2
        }

        frame "Subnets privadas" {
            database "Amazon RDS\nPostgreSQL" as DB
        }

        node "Gateway VPC Endpoint\npara S3" as VPCE
    }
}

' Acesso ao front-end e APIs
User --> S3Front : Acessa aplicação (RF-04)
S3Front --> EC2 : Requisições REST\nEventos e auditórios
S3Front --> APIGW : Consulta de ocupação (RF-03)
APIGW --> LambdaReport : GET /relatorios/ocupacao
LambdaReport --> DB : Agrega eventos por auditório

' Upload de banner
S3Front --> EC2 : Solicita URL pré-assinada (RF-01)
EC2 --> S3Front : Retorna URL pré-assinada
User --> S3Banners : Upload direto com URL
EC2 --> DB : Persiste caminho do banner

' Gestão do sistema
EC2 --> DB : CRUD, disponibilidade e bloqueios\n(RF-05, RF-06, RF-07, RF-08)

' Processamento de imagem
S3Banners --> LambdaThumb : ObjectCreated (RF-02)
LambdaThumb --> S3Banners : Armazena miniatura
LambdaThumb --> DB : Atualiza thumbnail_url

' Acesso ao S3 pela VPC
EC2 ..> VPCE : Acesso privado ao S3
VPCE ..> S3Banners : Gateway Endpoint

note right of LambdaThumb
Se precisar acessar o RDS privado,
configurar conectividade com a VPC.
Filtrar eventos para evitar
recursão na geração de miniaturas.
end note

note right of LambdaReport
Se o RDS estiver em subnets privadas,
configurar a Lambda para alcançá-lo.
end note

note bottom of EC2
A subnet pública exige rota para
Internet Gateway e regras de acesso.
end note

@enduml
