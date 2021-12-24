# AppSec-Labs

### Install Docker

```
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable docker --now
sudo usermod -aG docker $USER
newgrp docker
docker --version
```
