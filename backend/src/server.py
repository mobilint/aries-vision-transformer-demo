import logging
import torch
import os
import cv2
import base64
import time
import re

from flask import Flask
from flask_socketio import SocketIO, emit
from PIL import Image
from io import BytesIO

from transformers import AutoProcessor, AutoModelForImageTextToText
from qbruntime import Accelerator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

result_path = "./results"

app = Flask(__name__)
socketio = SocketIO(app, debug=True, cors_allowed_origins="*")

gpu_available = torch.cuda.is_available()
npu_available = False
try:
    acc = Accelerator()
    del acc
    npu_available = True
except:
    pass

logging.info(f'[DEVICE] GPU: {"O" if gpu_available else "X"}, NPU: {"O" if npu_available else "X"}')

if gpu_available == False and npu_available == False:
    raise SystemError("No AI Accelerator Found!")

model_id = "Salesforce/blip-image-captioning-large"

if npu_available:
    model_id = re.sub(r"^[^/]+", "mobilint", model_id)

processor = AutoProcessor.from_pretrained(
    model_id,
    trust_remote_code=True,
    use_fast=True
)
model = AutoModelForImageTextToText.from_pretrained(
    model_id,
    trust_remote_code=True,
).to("cpu" if npu_available else "cuda:0")

@socketio.on("describe")
def describe(base64Image: str):
    if os.path.isdir(result_path) == False:
        os.mkdir(result_path)

    header = "data:image/webp;base64,"
    image = Image.open(BytesIO(base64.b64decode(base64Image[len(header) :])))
    image.save(f"{result_path}/current.png")

    frame = cv2.imread(f"{result_path}/current.png")
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Do infer
    text = "An elaborated description of "
    start_time = time.time()
    inputs = processor(frame, text, return_tensors="pt").to("cpu" if npu_available else "cuda:0")

    out = model.generate(**inputs)
    end_time = time.time()
    elapsed_time = end_time - start_time

    print(f"Elapsed time: {elapsed_time:.2f} seconds")

    description = processor.decode(out[0], skip_special_tokens=True)

    emit("described", description[len(text) :])


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
