provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "vps2" {
  ami           = "ami-12345678"  # mete AMI VPS2 ou a
  instance_type = "t2.micro"
  tags = {
    Name = "FOBAS-VPS2"
  }
}
