# ARIES Vision Transformer Demo

## Installation & Usage (Windows)

Since Windows environment doesn't support PCIe hardware binding for Docker containers, you should run `flask` websocket server and `next.js` frontend server.

### Frontend

```shell
cd frontend
npm install
npm run dev
```

### Backend

```shell
cd backend
uv sync
uv run src/server.py
```

## Installation (Linux)

The instruction below will install docker, create docker network needed, update this repository, and download needed files to run this demo.

```shell
./update.sh
```

## Settings

This demo currently does not provide additional runtime configuration in README.

## Manual Installation & Usage

### Install Docker

Follow the [official instruction](https://docs.docker.com/engine/install/ubuntu/)
Also, set your user as `docker` group by following the [Linux post-installation steps](https://docs.docker.com/engine/install/linux-postinstall/)

### Create Docker Network

```shell
docker network create mblt_int
```

### Build

```shell
docker compose build
```

### Run (NPU mode, default)

```shell
docker compose up
```

### Run (GPU mode)

Before running GPU mode, install [nvidia-container-toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html).

```shell
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up
```

`docker-compose.gpu.yml` sets `gpus: all` so GPU containers are exposed to compose runtime.

### Runtime mode note

This demo is designed for hardware-accelerated inference only (NPU or GPU). CPU-only execution is not supported.

- `docker compose up`: NPU mode
  - uses [backend.Dockerfile](./backend/backend.Dockerfile) and NPU-backed runtime path.
- `docker compose -f docker-compose.yml -f docker-compose.gpu.yml up`: GPU mode
  - uses [backend/backend-gpu.Dockerfile](./backend/backend-gpu.Dockerfile) and requests `gpus: all`.

### Run on background

```shell
docker compose up -d
```

```shell
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d
```

### Shutdown background

```shell
docker compose down
```

## Setup Shortcut

Path to this repository should be `~/aries-vision-transformer-demo`.

If needed, you can update the path in `vision-transformer-demo.desktop` and `run.sh` before copying.

```shell
mkdir -p "$HOME/.local/share/applications"
cp vision-transformer-demo.desktop "$HOME/.local/share/applications/"
```

Then, add the `Vision Transformer` icon to apps and pin it to favorites.
