from flask import Flask, request, jsonify, render_template
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os

app = Flask(__name__)

# Load trained MobileNet model
MODEL_PATH = "cat_dog_mobilenet.h5"
model = tf.keras.models.load_model(MODEL_PATH)

# Prediction function
def predict_image(img_path):
    try:
        img = image.load_img(img_path, target_size=(224, 224))  # MobileNet expects 224x224
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)[0][0]
        return "Dog 🐶" if prediction > 0.5 else "Cat 🐱"
    except Exception as e:
        return f"Error: {str(e)}"

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def upload():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"})

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"})

        # Save uploaded file
        upload_folder = os.path.join("static", "uploads")
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, file.filename)
        file.save(filepath)

        # Run prediction
        result = predict_image(filepath)

        return jsonify({"prediction": result})

    except Exception as e:
        # Always return JSON, never HTML
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
