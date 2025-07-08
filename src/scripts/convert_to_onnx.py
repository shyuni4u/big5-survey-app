import torch
from model import PsychModel  # 반드시 동일한 모델 정의 필요
import os

def convert_pth_to_onnx(pth_path="model.pth", onnx_path="model.onnx"):
    if not os.path.exists(pth_path):
        raise FileNotFoundError(f"{pth_path} not found.")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ✅ Fix: Set weights_only=False
    checkpoint = torch.load(pth_path, map_location=device, weights_only=False)
    label_classes = checkpoint["label_classes"]
    num_classes = len(label_classes)

    from model import PsychModel  # make sure it's available
    model = PsychModel(num_classes=num_classes).to(device)
    model.load_state_dict(checkpoint["model_state"])
    model.eval()

    dummy_input = torch.randn(1, 5).to(device)

    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )

    print(f"✅ Converted {pth_path} → {onnx_path}")

if __name__ == "__main__":
    convert_pth_to_onnx("model.pth", "model.onnx")