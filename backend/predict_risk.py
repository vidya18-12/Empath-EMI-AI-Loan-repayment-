import sys
import pickle
import json
import os
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

def load_model(filename):
    try:
        with open(filename, 'rb') as file:
            return pickle.load(file)
    except FileNotFoundError:
        print(f"Error: Model file {filename} not found", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error loading {filename}: {str(e)}", file=sys.stderr)
        sys.exit(1)

def main():
    # Load models
    base_path = os.path.dirname(os.path.abspath(__file__))
    vectorizer = load_model(os.path.join(base_path, 'tfidf_vectorizer.pkl'))
    risk_model = load_model(os.path.join(base_path, 'risk_severity_model.pkl'))
    action_model = load_model(os.path.join(base_path, 'bank_action_model.pkl'))

    # Read input from stdin
    try:
        input_data = sys.stdin.read()
        if not input_data:
            return
            
        # Parse JSON input if possible, otherwise treat as raw text
        try:
            data = json.loads(input_data)
            text = data.get('text', '')
        except json.JSONDecodeError:
            text = input_data.strip()

        if not text:
            print(json.dumps({"error": "No text provided"}))
            return

        # Vectorize
        text_vectorized = vectorizer.transform([text])

        # Predict
        risk_severity = risk_model.predict(text_vectorized)[0]
        bank_action = action_model.predict(text_vectorized)[0]
        
        # Get probabilities if available (optional, checking if predict_proba exists)
        risk_confidence = 0.0
        if hasattr(risk_model, 'predict_proba'):
             probs = risk_model.predict_proba(text_vectorized)
             risk_confidence = max(probs[0])

        result = {
            "risk_severity": risk_severity,
            "bank_action": bank_action,
            "risk_confidence": float(risk_confidence)
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
