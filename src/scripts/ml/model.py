import torch
import torch.nn as nn
import torch.nn.functional as F

class PsychModel(nn.Module):
    def __init__(self, num_classes=39, psych_emb=16, job_emb=16, use_job_emb=True, dropout_rate=0.3):
        super().__init__()
        self.use_job_emb = use_job_emb
        self.psych_emb = nn.Linear(5, psych_emb)
        self.job_emb = nn.Embedding(num_classes, job_emb) if use_job_emb else None
        self.dropout = nn.Dropout(p=dropout_rate)

        self.mlp1 = nn.Sequential(
            nn.Linear(psych_emb, 40), nn.ReLU(),
            nn.Dropout(p=dropout_rate),
            nn.Linear(40, 20), nn.ReLU()
        )

        mlp2_in = 20 + (job_emb if use_job_emb else 0)
        self.mlp2 = nn.Sequential(
            nn.Linear(mlp2_in, 18), nn.ReLU(),
            nn.Dropout(p=dropout_rate),
            nn.Linear(18, 9), nn.ReLU()
        )

        self.out = nn.Linear(9, num_classes)

    def forward(self, x, job_ids=None):
        psych = F.relu(self.psych_emb(x))
        h1 = self.mlp1(psych)

        if self.use_job_emb:
            if job_ids is None:
                job_ids = torch.zeros(x.size(0), dtype=torch.long, device=x.device)
            jb = self.job_emb(job_ids)
            h = torch.cat([h1, jb], dim=1)
        else:
            h = h1

        h2 = self.mlp2(h)
        return self.out(h2)
