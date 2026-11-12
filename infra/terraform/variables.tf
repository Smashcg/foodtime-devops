variable "aws_region" {
  description = "Região da AWS para o provisionamento dos recursos"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome do projeto para identificação e prefixos de recursos"
  type        = string
  default     = "foodtime"
}

variable "environment" {
  description = "Ambiente de implantação (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "instance_type" {
  description = "Tipo da instância EC2 (compatível com AWS Academy / Free Tier)"
  type        = string
  default     = "t2.micro"
}

variable "app_port" {
  description = "Porta TCP exposta pela aplicação FoodTime"
  type        = number
  default     = 3000
}

