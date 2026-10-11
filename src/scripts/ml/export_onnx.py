import torch
import json
import os
from model import PsychModel  # model.py의 PsychModel 클래스를 임포트

# --- 설정 ---
MODEL_CHECKPOINT_PATH = "model.pth"
ONNX_MODEL_PATH = "model.onnx"  # ONNX 모델을 저장할 경로
# 출력 인덱스 → 레이블 매핑 파일. model.onnx와 같은 디렉터리(public/models/<game>/)에 함께 배치해야 합니다.
LABELS_JSON_PATH = os.path.join(os.path.dirname(ONNX_MODEL_PATH) or ".", "labels.json")

# --- 1. 체크포인트 로드 및 모델 초기화 ---
print(f"'{MODEL_CHECKPOINT_PATH}'에서 체크포인트를 로드합니다...")
# `weights_only=False`로 설정하여 클래스 이름 리스트도 함께 로드합니다.
checkpoint = torch.load(MODEL_CHECKPOINT_PATH, map_location="cpu", weights_only=False)

# 체크포인트에서 클래스 개수와 레이블 이름들을 가져옵니다.
# label_classes는 sklearn LabelEncoder.classes_ (정렬된 "Class_Spec" 문자열)이며,
# 모델 출력 인덱스 i는 label_classes[i]에 대응합니다.
label_classes = [str(label) for label in checkpoint["label_classes"]]
num_classes = len(label_classes)

# 모델 구조를 불러오고 학습된 가중치를 적용합니다.
model = PsychModel(num_classes=num_classes)
model.load_state_dict(checkpoint["model_state"])
model.eval()  # 추론 모드로 설정

print("모델 로드 완료.")

# --- 2. ONNX로 모델 변환 ---
# 모델 입력에 맞는 더미 텐서를 생성합니다 (배치 크기 1, 입력 특성 5).
dummy_input = torch.randn(1, 5)

print(f"모델을 ONNX 형식으로 변환하여 '{ONNX_MODEL_PATH}'에 저장합니다...")
torch.onnx.export(
    model,
    dummy_input,
    ONNX_MODEL_PATH,
    export_params=True,
    opset_version=11,
    do_constant_folding=True,
    input_names=['input'],   # ONNX 모델의 입력 레이어 이름
    output_names=['output'], # ONNX 모델의 출력 레이어 이름
)

print("✅ ONNX 모델 변환 완료!")

# --- 3. 클래스 레이블을 labels.json으로 내보내기 ---
# 브라우저 추론(src/lib/onnx.ts)은 이 파일을 fetch해서 출력 인덱스에 레이블을 붙입니다.
# model.onnx와 labels.json을 반드시 함께 public/models/<game>/ 에 복사하세요.
with open(LABELS_JSON_PATH, "w", encoding="utf-8", newline="\n") as f:
    f.write(json.dumps(label_classes, indent=2, ensure_ascii=False) + "\n")

print(f"✅ 클래스 레이블 {num_classes}개를 '{LABELS_JSON_PATH}'에 저장했습니다.")
