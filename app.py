from flask import Flask, render_template, request, jsonify
import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image

app = Flask(__name__)

# Load your trained model
model = load_model("cat_dog_mobilenet.h5")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    # Save uploaded file temporarily
    filepath = os.path.join("static", file.filename)
    file.save(filepath)

    # Preprocess image
    img = Image.open(filepath).convert("RGB").resize((224, 224))
    img_array = np.expand_dims(np.array(img) / 255.0, axis=0)

    # Predict
    prediction = model.predict(img_array)[0][0]  # sigmoid output
    confidence = prediction if prediction >= 0.5 else 1 - prediction

    # Stricter threshold
    threshold = 0.80  # 80% required
    if confidence < threshold:
        label = "❓ Neither Cat nor Dog"
    else:
        label = "🐱 Cat" if prediction < 0.5 else "🐶 Dog"

    return jsonify({
        'label': label,
        'confidence': float(confidence * 100)
    })

if __name__ == "__main__":
    app.run(debug=True)
