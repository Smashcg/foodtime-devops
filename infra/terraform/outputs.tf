output "s3_bucket_name" {
  description = "Nome exclusivo do Bucket S3 criado para artefatos e arquivos estaticos"
  value       = aws_s3_bucket.artifacts.id
}

output "s3_bucket_arn" {
  description = "ARN do Bucket S3"
  value       = aws_s3_bucket.artifacts.arn
}

output "ec2_public_ip" {
  description = "Endereco IP publico da instancia EC2 do FoodTime"
  value       = aws_instance.app_server.public_ip
}

output "ec2_instance_id" {
  description = "ID da instancia EC2 criada"
  value       = aws_instance.app_server.id
}

output "application_url" {
  description = "URL para acessar a aplicacao FoodTime no navegador"
  value       = "http://${aws_instance.app_server.public_ip}:${var.app_port}"
}

output "metrics_url" {
  description = "URL para coleta de metricas Prometheus na instancia"
  value       = "http://${aws_instance.app_server.public_ip}:${var.app_port}/metrics"
}

output "cloudwatch_alarm_name" {
  description = "Nome do alarme CloudWatch provisionado"
  value       = aws_cloudwatch_metric_alarm.high_cpu_alarm.alarm_name
}
