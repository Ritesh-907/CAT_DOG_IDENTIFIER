const form = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const resultDiv = document.getElementById("result");
const previewDiv = document.getElementById("preview");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!fileInput.files.length) {
    alert("Please select an image file!");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  // Show image preview
  const reader = new FileReader();
  reader.onload = function (e) {
    previewDiv.innerHTML = `<img src="${e.target.result}" width="200" style="margin-top:10px;border-radius:10px;">`;
  };
  reader.readAsDataURL(fileInput.files[0]);

  // Call backend /predict
  resultDiv.innerHTML = "⏳ Predicting...";
  try {
    const res = await fetch("/predict", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.prediction) {
      resultDiv.innerHTML = `<h2>✅ Prediction: ${data.prediction}</h2>`;
    } else {
      resultDiv.innerHTML = `<h2>⚠️ Error: ${data.error}</h2>`;
    }
  } catch (err) {
    resultDiv.innerHTML = `<h2>❌ Failed: ${err.message}</h2>`;
  }
});
