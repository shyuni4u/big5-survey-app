import os
import pandas as pd
import torch
import torch.nn as nn
from torch.optim import Adam
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from torch.utils.tensorboard import SummaryWriter
from torch.optim.lr_scheduler import CosineAnnealingLR
import json
import numpy as np
from model import PsychModel

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

class PsychDataset(Dataset):
    def __init__(self, csv_path, label_classes=None):
        print("📥 Reading CSV...")
        df = pd.read_csv(csv_path)

        print("🔍 Parsing answers...")
        df["ans_dict"] = df["answers"].apply(json.loads)
        # df["ans_dict"] = df["answers"].apply(lambda x: ast.literal_eval(x))

        print("📊 Extracting traits...")
        df[["A", "C", "E", "N", "O"]] = df["ans_dict"].apply(pd.Series)
        df["label"] = df["class"] + "_" + df["specialization"]
        self.label_enc = LabelEncoder()

        if label_classes is not None:
            self.label_enc.classes_ = label_classes
            df["label_id"] = self.label_enc.transform(df["label"])
        else:
            df["label_id"] = self.label_enc.fit_transform(df["label"])
            
        print("🧪 Checking for NaNs...")
        trait_cols = ["A", "C", "E", "N", "O"]
        df[trait_cols] = df[trait_cols].apply(pd.to_numeric, errors="coerce")
        nan_rows = df[trait_cols].isna().sum().sum()
        if nan_rows > 0:
            print(f"⚠️ Found {nan_rows} NaN values, dropping them")
            df.dropna(subset=trait_cols, inplace=True)

        # Convert to tensor and normalize to -1 to 1
        # Original range 0-100. To normalize to -1 to 1: (value / 50) - 1
        print("🧪 Converting X to tensor...")
        X_np = df[["A", "C", "E", "N", "O"]].to_numpy().astype(np.float32)
        self.X = torch.from_numpy(X_np)
        self.X = (self.X / 50.0) - 1.0
        print("✅ X tensor created.")
        
        print("🧪 Converting y to tensor...")
        self.y = torch.tensor(df["label_id"].values, dtype=torch.long)
        print("✅ y tensor created.")
        self.num_classes = len(self.label_enc.classes_)
        # print(self.num_classes, self.label_enc.classes_)

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

def train(csv_path, epochs=2000, batch_size=512, lr=2e-4, model_path="model.pth"):
    label_classes = None
    model = None

    # Load pre-trained model if exists
    if os.path.exists(model_path):
        print(f"Loading pretrained model from {model_path}")
        checkpoint = torch.load(model_path, map_location=device, weights_only=False)
        label_classes = checkpoint["label_classes"]

    # Dataset and dataloader
    ds = PsychDataset(csv_path, label_classes=label_classes)
    print("📦 Splitting dataset...")
    train_idx, val_idx = train_test_split(range(len(ds)), test_size=0.2, random_state=42)
    print(f"✅ Train size: {len(train_idx)}, Val size: {len(val_idx)}")
    
    print("📦 Building dataloaders...")
    train_dl = DataLoader(torch.utils.data.Subset(ds, train_idx), batch_size=batch_size, shuffle=True)
    val_dl = DataLoader(torch.utils.data.Subset(ds, val_idx), batch_size=batch_size)
    print("✅ Dataloaders ready.")

    # Model
    print("🧠 Initializing model...")
    model = PsychModel(num_classes=ds.num_classes).to(device)

    if os.path.exists(model_path):
        model.load_state_dict(checkpoint["model_state"])
        print("Model weights loaded.")

    # Training components
    opt = Adam(model.parameters(), lr=lr)
    scheduler = CosineAnnealingLR(opt, T_max=epochs)
    crit = nn.CrossEntropyLoss()
    writer = SummaryWriter(log_dir="runs/psych_model")

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0
        for X, y in train_dl:
            X, y = X.to(device), y.to(device)
            logits = model(X)
            loss = crit(logits, y)
            opt.zero_grad()
            loss.backward()
            opt.step()
            total_loss += loss.item() * X.size(0)

        avg_loss = total_loss / len(train_dl.dataset)
        scheduler.step()

        # Validation
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

        if epoch % 10 == 0:
            print(f"Epoch {epoch:02d} – Loss: {avg_loss:.4f}, Val Acc: {acc:.4f}")

    torch.save({
        "model_state": model.state_dict(),
        "label_classes": ds.label_enc.classes_
    }, model_path)

    writer.close()
    print("✅ Training complete. Model saved to", model_path)

if __name__ == "__main__":
    import sys
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "data.csv"
    train(csv_path)