---
title: "Video scene boundary detection"
summary: "An R package that finds scene changes by tracking shifts in the direction of greatest variation in video embeddings."
links: [{"label":"R package on GitHub","href":"https://github.com/sushilkhadkaanon/scenechangedetpca"}]
order: 1
---

The package samples frames and computes embeddings using a pretrained ResNet-50 with R torch and torchvision. It fits principal component analysis on overlapping windows and compares consecutive leading eigenvectors. The change score uses the absolute cosine similarity because flipping an eigenvector’s sign leaves its axis unchanged.

Frame sampling, the score threshold, and the minimum time between cuts are configurable. The package returns cut timestamps and can export short clips around them with FFmpeg.
