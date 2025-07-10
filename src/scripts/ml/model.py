import torch
import torch.nn as nn
import torch.nn.functional as F

class PsychModel(nn.Module):
    """
    입력: A, C, E, N, O (실수형 5차원)
    출력: class_specialization 조합의 softmax 예측
    input_dim=5, 출력 num_classes=39일 때 중간 레이어 최적화
    hidden1 ≈ 40, hidden2 ≈ 20
    """
    def __init__(self, num_classes=39, psych_emb=16, job_emb=16, use_job_emb=True):
        super().__init__()

        self.use_job_emb = use_job_emb
        # 심리 입력 임베딩
        self.psych_emb = nn.Linear(5, psych_emb)

        # 직업 레이블을 위한 범주 임베딩
        self.job_emb = nn.Embedding(num_classes, job_emb) if use_job_emb else None

        # 초기 MLP (심리 임베딩만 사용)
        self.mlp1 = nn.Sequential(
            nn.Linear(psych_emb, 40), nn.ReLU(),
            nn.Linear(40, 20), nn.ReLU()
        )

        # job_emb 포함 시, 입력 차원 = 20 + job_emb
        mlp2_in = 20 + (job_emb if use_job_emb else 0)
        self.mlp2 = nn.Sequential(
            nn.Linear(mlp2_in, 18), nn.ReLU(),
            nn.Linear(18, 9), nn.ReLU()
        )

        # 최종 출력층
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