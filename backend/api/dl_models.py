import torch
import torch.nn as nn
from transformers import AutoModel

MODEL_NAME = "roberta-base"
HIDDEN_DIM = 768

class BaselineModel(nn.Module):
    def __init__(self, num_labels):
        super().__init__()
        self.transformer = AutoModel.from_pretrained(MODEL_NAME)
        self.classifier = nn.Linear(HIDDEN_DIM, num_labels)

    def forward(self, ids, mask):
        out = self.transformer(ids, mask).last_hidden_state[:, 0, :]
        return self.classifier(out)


class CoTEGModel(nn.Module):
    def __init__(self, num_labels, adj):
        super().__init__()

        self.text_encoder = nn.Module()
        self.text_encoder.transformer = AutoModel.from_pretrained(MODEL_NAME)

        self.label_embeddings = nn.Embedding(num_labels, HIDDEN_DIM)

        self.gcn = nn.Module()
        self.gcn.linear = nn.Linear(HIDDEN_DIM, HIDDEN_DIM)
        self.gcn.norm = nn.LayerNorm(HIDDEN_DIM)

        self.A = nn.Parameter(adj)

    def forward(self, ids, mask):
        text = self.text_encoder.transformer(ids, mask).last_hidden_state[:, 0, :]

        curr_A = torch.relu(self.A)
        norm_A = curr_A / (curr_A.sum(1, keepdim=True) + 1e-6)

        weight_input = self.label_embeddings.weight
        gcn_out = self.gcn.norm(torch.relu(norm_A @ self.gcn.linear(weight_input)) + weight_input)

        return text @ gcn_out.T