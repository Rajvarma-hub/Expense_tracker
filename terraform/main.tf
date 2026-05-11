provider "aws" {
  region = "ap-south-1"
}

resource "aws_ecr_repository" "backend" {
  name = "expense-backend"
}

resource "aws_ecr_repository" "frontend" {
  name = "expense-frontend"
}

output "backend_ecr_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_url" {
  value = aws_ecr_repository.frontend.repository_url
}