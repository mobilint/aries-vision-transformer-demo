# ARIES Vision Transformer Demo

Offline image captioning demo for ARIES / Mobilint hardware.

The current implementation uses:

- `Flask-SocketIO` backend for image capture and caption generation
- `Next.js` frontend for the live camera UI
- a single backend model definition in `backend/src/server.py`
- frontend-owned page layout and styling in `frontend/app/page.tsx`

## Repository Structure

- [backend/src/server.py](./backend/src/server.py): websocket server, model loading, and caption generation flow
- [frontend/app/page.tsx](./frontend/app/page.tsx): live camera UI, capture controls, and description rendering
- [frontend/app/layout.tsx](./frontend/app/layout.tsx): page metadata and root layout
- [frontend/app/globals.css](./frontend/app/globals.css): global frontend styles
- [vision-transformer-demo.desktop](./vision-transformer-demo.desktop): desktop launcher entry
- [run.sh](./run.sh): helper script used by the desktop shortcut

## Supported Locales

This demo currently exposes a single built-in English UI and does not provide locale-specific prompt bundles.

## Installation & Usage (Windows)

Windows does not support the Docker PCIe/NPU binding flow used on Linux, so run the backend and frontend directly.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Backend

```powershell
cd backend
uv sync
uv run src/server.py
```

Open `http://localhost:3000`.

## Installation & Usage (Linux)

The helper script installs dependencies, prepares the Docker network, updates the repository, and downloads required assets.

```bash
./update.sh
```

## Manual Linux Setup

### Install Docker

Follow the official Docker Engine instructions:

- <https://docs.docker.com/engine/install/ubuntu/>
- <https://docs.docker.com/engine/install/linux-postinstall/>

### Create Docker Network

```bash
docker network create mblt_int
```

### Build

```bash
docker compose build
```

### Run (NPU mode)

```bash
docker compose up
```

### Run (GPU mode)

Install NVIDIA Container Toolkit first:

- <https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html>

Then run:

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up
```

`docker-compose.gpu.yml` sets `gpus: all`.

### Run in Background

```bash
docker compose up -d
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d
```

### Stop

```bash
docker compose down
```

## Runtime Notes

### Hardware requirement

This demo is designed for hardware-accelerated inference only.
CPU-only execution is not supported.

### Backend model loading

The backend loads `Salesforce/blip-image-captioning-large` on startup.

When an NPU is available, the repository switches the model namespace to the Mobilint runtime variant before loading.

### GPU torch backend

[backend/backend-gpu.Dockerfile](./backend/backend-gpu.Dockerfile) installs PyTorch with `uv --torch-backend`.

- default is `cu124` (`ARG TORCH_BACKEND=cu124`)
- you can override it at build time if needed:

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml build --build-arg TORCH_BACKEND=cu121
```

- `auto` is not recommended for Docker GPU image builds because build-time environment detection may select CPU wheels

### Runtime mode note

- `docker compose up`: NPU mode
  uses [backend/backend.Dockerfile](./backend/backend.Dockerfile) and the NPU-backed runtime path.
- `docker compose -f docker-compose.yml -f docker-compose.gpu.yml up`: GPU mode
  uses [backend/backend-gpu.Dockerfile](./backend/backend-gpu.Dockerfile) and requests `gpus: all`.

## Configuration

### Change the frontend title or UI text

Edit [frontend/app/page.tsx](./frontend/app/page.tsx).

### Change page metadata

Edit [frontend/app/layout.tsx](./frontend/app/layout.tsx).

### Change the captioning model

Edit the `model_id` value in [backend/src/server.py](./backend/src/server.py).

## Development Checks

Frontend production build:

```powershell
cd frontend
npm run build
```

Backend syntax check:

```powershell
python -m py_compile backend/src/server.py
```

## Desktop Shortcut

If you use the provided desktop shortcut, this repository is expected at `~/aries-vision-transformer-demo`.

If needed, update the path in:

- [vision-transformer-demo.desktop](./vision-transformer-demo.desktop)
- [run.sh](./run.sh)

Then install the desktop entry:

```bash
mkdir -p "$HOME/.local/share/applications"
cp vision-transformer-demo.desktop "$HOME/.local/share/applications/"
```
