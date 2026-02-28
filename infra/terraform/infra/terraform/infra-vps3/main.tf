provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "vps3" {
  ami           = "ami-12345678" # ranplase ak AMI ou
  instance_type = "t3.medium"
  key_name      = "fobas-dev-ssh"
  tags = {
    Name = "FOBAS-VPS3-Workers"
  }
}
