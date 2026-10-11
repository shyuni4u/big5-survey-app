"""
학습된 체크포인트(model.pth)를 브라우저용 ONNX 모델과 labels.json 으로 내보낸다.

사용법 (src/scripts 디렉터리에서):
  venv/Scripts/python.exe ml/export_onnx.py --model models/wow/model.pth --onnx ../../public/models/wow/model.onnx

- labels.json 은 --onnx 와 같은 디렉터리에 함께 쓰인다 (--labels 로 바꿀 수 있음).
- label_classes 는 sklearn LabelEncoder.classes_ (정렬된 "Class_Spec" 문자열)이며,
  모델 출력 인덱스 i 는 label_classes[i] 에 대응한다. 브라우저 추론(src/lib/onnx.ts)이 이 파일을 읽는다.
"""
import argparse
import json
import os

import torch

from model import PsychModel

parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
parser.add_argument("--model", default="model.pth", help="체크포인트 경로")
parser.add_argument("--onnx", default="model.onnx", help="ONNX 출력 경로")
parser.add_argument("--labels", default=None, help="labels.json 출력 경로 (기본: ONNX 옆)")
args = parser.parse_args()

MODEL_CHECKPOINT_PATH = args.model
ONNX_MODEL_PATH = args.onnx
LABELS_JSON_PATH = args.labels or os.path.join(os.path.dirname(ONNX_MODEL_PATH) or ".", "labels.json")

# --- 1. 체크포인트 로드 및 모델 초기화 ---
print(f"'{MODEL_CHECKPOINT_PATH}'에서 체크포인트를 로드합니다...")
checkpoint = torch.load(MODEL_CHECKPOINT_PATH, map_location="cpu", weights_only=False)
label_classes = [str(label) for label in checkpoint["label_classes"]]
num_classes = len(label_classes)

model = PsychModel(num_classes=num_classes)
model.load_state_dict(checkpoint["model_state"])
model.eval()
print(f"모델 로드 완료 (클래스 {num_classes}개, 검증 정확도 {checkpoint.get('acc', float('nan')):.4f}).")

# --- 2. ONNX로 모델 변환 ---
os.makedirs(os.path.dirname(ONNX_MODEL_PATH) or ".", exist_ok=True)
dummy_input = torch.randn(1, 5)
print(f"모델을 ONNX 형식으로 변환하여 '{ONNX_MODEL_PATH}'에 저장합니다...")
torch.onnx.export(
    model,
    dummy_input,
    ONNX_MODEL_PATH,
    export_params=True,
    opset_version=11,
    do_constant_folding=True,
    input_names=["input"],
    output_names=["output"],
    dynamo=False,
)
print("ONNX 모델 변환 완료.")

# --- 3. 클래스 레이블을 labels.json으로 내보내기 ---
with open(LABELS_JSON_PATH, "w", encoding="utf-8", newline="\n") as f:
    f.write(json.dumps(label_classes, indent=2, ensure_ascii=False) + "\n")
print(f"클래스 레이블 {num_classes}개를 '{LABELS_JSON_PATH}'에 저장했습니다.")
