terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  region = "us-east-1"
}

# Exemple de VPS resource
resource "aws_instance" "fobas_server_1" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
  tags = {
    Name = "FOBAS-Server-1"
  }
}
