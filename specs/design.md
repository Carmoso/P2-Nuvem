# Design e Arquitetura do Sistema (Design)

## 1. Diagrama de Arquitetura

```plantuml
@startuml
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v18.0/dist

node "Navegador (Usuário)" as User

cloud "AWS Learner Lab" {
    node "S3 (Frontend Website Estático)" as S3Front
    node "S3 (Bucket de Banners)" as S3Banners
    node "API Gateway" as APIGW
    
    frame "VPC" {
        frame "Subnet Pública" {
            node "EC2 (Docker - Node.js/Python API)" as EC2_API
        }
        frame "Subnet Privada" {
            database "Amazon RDS (PostgreSQL)" as DB
        }
        node "VPC Gateway Endpoint (S3)" as VPCE
    }
    
    node "AWS Lambda (Gerar Thumbnail)" as LambdaThumb
    node "AWS Lambda (Relatório de Ocupação)" as LambdaReport
}

User --> S3Front : 1. Acessa a aplicação web (RF-05)
User --> APIGW : 2. Requisições REST
User --> S3Banners : 3. Upload de arquivo via URL pré-assinada (RF-02)

APIGW --> EC2_API : Rotas de CRUD
APIGW --> LambdaReport : GET /relatorios/...

EC2_API --> DB : Persistência de Dados (RF-01)
EC2_API --> S3Banners : Solicita URL pré-assinada

S3Banners --> LambdaThumb : Trigger: Evento ObjectCreated (RF-03)
LambdaThumb --> VPCE : Envia miniatura via endpoint interno
LambdaThumb --> DB : Atualiza URL da miniatura no registro do Evento

LambdaReport --> DB : Executa JOIN/GROUP BY (RF-04)
@enduml
