"""
Big5 -> 직업 분류 모델 학습 스크립트.

사용법 (src/scripts 디렉터리에서):
  venv/Scripts/python.exe ml/train.py --csv data/wow.csv --model models/wow/model.pth --log-dir runs/wow

- CSV는 src/scripts/dataset/build.ts 가 만든 형식(app, answers, class, specialization, ...)을 읽는다.
- --model 경로에 체크포인트가 있고 라벨 집합이 CSV와 같으면 이어서 학습하고,
  라벨 집합이 다르면(직업 추가/삭제) 경고 후 처음부터 새로 학습한다. --fresh 로 강제할 수 있다.
- 검증 정확도가 가장 높았던 시점의 가중치만 --model 에 저장된다.
"""
import argparse
import ast
import os
import random

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight
from torch.optim import Adam
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader, Dataset
from torch.utils.tensorboard import SummaryWriter

from model import PsychModel

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TRAITS = ["A", "C", "E", "N", "O"]


def load_frame(csv_path):
    df = pd.read_csv(csv_path)
    df["ans_dict"] = df["answers"].apply(ast.literal_eval)
    df[TRAITS] = df["ans_dict"].apply(pd.Series)
    df["label"] = df["class"] + "_" + df["specialization"]
    return df


class PsychDataset(Dataset):
    def __init__(self, df, label_classes=None):
        self.label_enc = LabelEncoder()
        if label_classes is not None:
            self.label_enc.classes_ = np.array(label_classes)
            df["label_id"] = self.label_enc.transform(df["label"])
        else:
            df["label_id"] = self.label_enc.fit_transform(df["label"])

        # 0~100 점수를 -1~1 로 정규화 (브라우저 추론 onnx.ts 와 동일한 식)
        self.X = torch.tensor(df[TRAITS].values, dtype=torch.float32) / 50.0 - 1.0
        self.y = torch.tensor(df["label_id"].values, dtype=torch.long)
        self.num_classes = len(self.label_enc.classes_)

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def train(csv_path, model_path, log_dir, epochs=2000, batch_size=256, lr=2e-4, patience=20, seed=42, fresh=False):
    set_seed(seed)
    print(f"Using device: {device}")

    df = load_frame(csv_path)
    csv_labels = sorted(df["label"].unique())

    checkpoint = None
    if not fresh and os.path.exists(model_path):
        checkpoint = torch.load(model_path, map_location=device, weights_only=False)
        ckpt_labels = [str(label) for label in checkpoint["label_classes"]]
        if ckpt_labels != csv_labels:
            added = sorted(set(csv_labels) - set(ckpt_labels))
            removed = sorted(set(ckpt_labels) - set(csv_labels))
            print(f"[warn] label set changed (added {added}, removed {removed}); training from scratch instead of resuming.")
            checkpoint = None
        else:
            print(f"Loading pretrained model from {model_path}")

    ds = PsychDataset(df, label_classes=csv_labels if checkpoint else None)
    print(f"samples={len(ds)}  classes={ds.num_classes}")

    labels = ds.y.cpu().numpy()
    class_weights = compute_class_weight(class_weight="balanced", classes=np.unique(labels), y=labels)
    class_weights_tensor = torch.tensor(class_weights, dtype=torch.float32).to(device)

    train_idx, val_idx = train_test_split(range(len(ds)), test_size=0.2, random_state=seed, stratify=labels)
    train_dl = DataLoader(torch.utils.data.Subset(ds, train_idx), batch_size=batch_size, shuffle=True)
    val_dl = DataLoader(torch.utils.data.Subset(ds, val_idx), batch_size=batch_size)

    model = PsychModel(num_classes=ds.num_classes).to(device)
    if checkpoint is not None:
        model.load_state_dict(checkpoint["model_state"])
        print("Model weights loaded.")

    opt = Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(opt, T_max=epochs)
    crit = nn.CrossEntropyLoss(weight=class_weights_tensor)
    writer = SummaryWriter(log_dir=log_dir)

    os.makedirs(os.path.dirname(model_path) or ".", exist_ok=True)
    best_acc = 0.0
    best_epoch = 0
    epochs_no_improve = 0

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        for X, y in train_dl:
            X, y = X.to(device), y.to(device)
            loss = crit(model(X), y)
            opt.zero_grad()
            loss.backward()
            opt.step()
            total_loss += loss.item() * X.size(0)
        avg_loss = total_loss / len(train_dl.dataset)
        scheduler.step()

        model.eval()
        correct = total = 0
        with torch.no_grad():
            for Xv, yv in val_dl:
                Xv, yv = Xv.to(device), yv.to(device)
                preds = model(Xv).argmax(dim=1)
                correct += (preds == yv).sum().item()
                total += len(yv)
        acc = correct / total

        writer.add_scalar("Loss/train", avg_loss, epoch)
        writer.add_scalar("Accuracy/val", acc, epoch)
        writer.add_scalar("LR", scheduler.get_last_lr()[0], epoch)

        if acc > best_acc:
            best_acc, best_epoch, epochs_no_improve = acc, epoch, 0
            torch.save(
                {"model_state": model.state_dict(), "label_classes": ds.label_enc.classes_, "epoch": epoch, "acc": acc},
                model_path,
            )
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= patience:
                print("Early stopping triggered.")
                break

        if epoch % 10 == 0:
            print(f"Epoch {epoch:04d} - Loss: {avg_loss:.4f}, Val Acc: {acc:.4f} (best {best_acc:.4f} @ {best_epoch})")

    writer.close()
    print(f"Training complete. Best val acc {best_acc:.4f} at epoch {best_epoch}. Model saved to {model_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--csv", default="data.csv")
    parser.add_argument("--model", default="model.pth")
    parser.add_argument("--log-dir", default="runs/psych_model")
    parser.add_argument("--epochs", type=int, default=2000)
    parser.add_argument("--batch-size", type=int, default=256)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--patience", type=int, default=20)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--fresh", action="store_true", help="기존 체크포인트를 무시하고 새로 학습")
    args = parser.parse_args()
    train(args.csv, args.model, args.log_dir, args.epochs, args.batch_size, args.lr, args.patience, args.seed, args.fresh)
