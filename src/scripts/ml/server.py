import torch
import torch.nn.functional as F
import litserve as ls
from model import PsychModel
from fastapi.middleware.cors import CORSMiddleware

class RecommendAPI(ls.LitAPI):
    def setup(self, device):
        ckpt = torch.load("model.pth", map_location=device, weights_only=False)
        classes = list(ckpt["label_classes"])
        self.model = PsychModel(num_classes=len(classes)).to(device)
        self.model.load_state_dict(ckpt["model_state"])
        self.model.eval()
        self.classes = classes
        self.device = device

    def predict(self, req):
        arr = req["answers"]  # 예: {"A":80,"C":60,"E":60,"N":40,"O":60}
        
        # Normalize the input values to -1 to 1
        # Original range 0-100. To normalize to -1 to 1: (value / 50) - 1
        normalized_a = (arr["A"] / 50.0) - 1.0
        normalized_c = (arr["C"] / 50.0) - 1.0
        normalized_e = (arr["E"] / 50.0) - 1.0
        normalized_n = (arr["N"] / 50.0) - 1.0
        normalized_o = (arr["O"] / 50.0) - 1.0

        x = torch.tensor([[normalized_a, normalized_c, normalized_e, normalized_n, normalized_o]], 
                         dtype=torch.float32, device=self.device)
                         
        with torch.no_grad():
            logits = self.model(x)
            probs = F.softmax(logits, dim=1).cpu().numpy()[0]
            
            # Get the top 5 probabilities and their indices
            top5_indices = probs.argsort()[-5:][::-1] # Sort in descending order
            top5_scores = probs[top5_indices]
            top5_labels = [self.classes[i] for i in top5_indices]

            results = []
            for i in range(len(top5_indices)):
                results.append({
                    "label": top5_labels[i],
                    "score": float(top5_scores[i])
                })
        return {"top_5_recommendations": results}

if __name__ == "__main__":
    api = RecommendAPI()
    server = ls.LitServer(api, accelerator="auto")
    server.app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    server.run(port=8000)