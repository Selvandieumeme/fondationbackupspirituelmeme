provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "vps3" {
  ami           = "ami-87654321"  # mete AMI VPS3 ou a
  instance_type = "t2.micro"
  tags = {
    Name = "FOBAS-VPS3"
  }
}
