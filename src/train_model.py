import argparse
import os
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import numpy as np

from .utils import ensure_dirs


def read_labels_mapping(labels_csv_path: str) -> Dict[str, str]:
	if not os.path.exists(labels_csv_path):
		return {}
	mapping: Dict[str, str] = {}
	for line in Path(labels_csv_path).read_text(encoding='utf-8').splitlines():
		line = line.strip()
		if not line:
			continue
		person_id, name = line.split(',', 1)
		mapping[person_id] = name
	return mapping


def load_images_and_labels(dataset_root: str) -> Tuple[List[np.ndarray], List[int], Dict[int, str]]:
	images: List[np.ndarray] = []
	labels: List[int] = []
	index_to_person: Dict[int, str] = {}
	person_to_index: Dict[str, int] = {}

	for person_id in sorted([d for d in os.listdir(dataset_root) if os.path.isdir(os.path.join(dataset_root, d))]):
		person_dir = os.path.join(dataset_root, person_id)
		if person_id not in person_to_index:
			idx = len(person_to_index)
			person_to_index[person_id] = idx
			index_to_person[idx] = person_id
		for file in sorted(os.listdir(person_dir)):
			if not (file.lower().endswith('.png') or file.lower().endswith('.jpg') or file.lower().endswith('.jpeg')):
				continue
			path = os.path.join(person_dir, file)
			img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
			if img is None:
				continue
			images.append(img)
			labels.append(person_to_index[person_id])

	return images, labels, index_to_person


def train_and_save(dataset_root: str, model_out_dir: str) -> None:
	ensure_dirs(model_out_dir)
	images, labels, index_to_person = load_images_and_labels(dataset_root)
	if len(images) < 2 or len(set(labels)) < 1:
		raise RuntimeError("Not enough data to train. Capture at least 2 images.")

	recognizer = cv2.face.LBPHFaceRecognizer_create(radius=1, neighbors=8, grid_x=8, grid_y=8)
	recognizer.train(images, np.array(labels))

	model_path = os.path.join(model_out_dir, 'model_lbph.yml')
	recognizer.write(model_path)

	label_index_path = os.path.join(model_out_dir, 'label_index.csv')
	with open(label_index_path, 'w', encoding='utf-8') as f:
		for idx, person_id in sorted(index_to_person.items()):
			f.write(f"{idx},{person_id}\n")

	print(f"Saved model to {model_path}")
	print(f"Saved label index to {label_index_path}")


def main() -> None:
	parser = argparse.ArgumentParser(description='Train LBPH model from captured dataset')
	parser.add_argument('--dataset', default=os.path.join('data', 'dataset'))
	parser.add_argument('--out', default='models')
	args = parser.parse_args()

	train_and_save(args.dataset, args.out)


if __name__ == '__main__':
	main()

