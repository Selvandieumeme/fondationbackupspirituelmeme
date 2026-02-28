provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "vps2" {
  ami           = "ami-12345678" # ranplase ak AMI ou
  instance_type = "t3.medium"
  key_name      = "fobas-dev-ssh"
  tags = {
    Name = "FOBAS-VPS2-API"
  }
}
