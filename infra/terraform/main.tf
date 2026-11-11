provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Course      = "PUC DevOps na Pratica - Fase 1"
    }
  }
}

# ------------------------------------------------------------------------------
# 1. Bucket S3 para Armazenamento de Artefatos de Build e Arquivos Estáticos
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "artifacts" {
  bucket_prefix = "${var.project_name}-${var.environment}-"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "artifacts_versioning" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts_encryption" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "artifacts_block_public" {
  bucket = aws_s3_bucket.artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ------------------------------------------------------------------------------
# 2. Security Group para a Instância da Aplicação
# ------------------------------------------------------------------------------
resource "aws_security_group" "app_sg" {
  name_prefix = "${var.project_name}-sg-"
  description = "Security Group para trafego web e monitoramento do FoodTime"

  ingress {
    description = "Acesso HTTP padrao"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Porta direta da aplicacao Node.js / Express"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Acesso administrativo via SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Trafego de saida liberado"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ------------------------------------------------------------------------------
# 3. Consulta de AMI Oficial Amazon Linux 2023
# ------------------------------------------------------------------------------
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ------------------------------------------------------------------------------
# 4. Instância EC2 para Execução da Aplicação
# ------------------------------------------------------------------------------
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y git nodejs npm
              
              # Instalar aplicacao FoodTime
              mkdir -p /opt/foodtime
              cd /opt/foodtime
              
              # Clone ou inicializacao de demonstracao
              cat << 'EOC' > server.js
              const http = require('http');
              const server = http.createServer((req, res) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, data: 'healthy!', service: 'FoodTime EC2' }));
              });
              server.listen(3000);
              EOC
              
              node server.js &
              EOF

  tags = {
    Name = "${var.project_name}-server-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# 5. Monitoramento: Alarme CloudWatch para Alto Uso de CPU
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "high_cpu_alarm" {
  alarm_name          = "${var.project_name}-HighCPUUtilization-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alerta disparado quando a utilizacao media de CPU da instancia EC2 do FoodTime ultrapassar 80% por 2 periodos consecutivos."

  dimensions = {
    InstanceId = aws_instance.app_server.id
  }
}
