.PHONY: setup train evaluate serve

setup:
	pip install -r requirements.txt

train:
	python3 -m training.train

evaluate:
	python3 -m evaluation.evaluate

serve:
	uvicorn serving.app:app --host 0.0.0.0 --port 8001 --reload
