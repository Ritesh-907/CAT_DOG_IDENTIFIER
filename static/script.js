const form = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const aiMessages = document.getElementById("ai-messages");
const dropArea = document.getElementById("drop-area");

const coolMessages = [
  "🤖 Using AI magic...",
  "📊 Crunching probabilities...",
  "🧠 Deep learning at work...",
  "⚡ Almost done..."
];

// Show preview image
function showPreview(file) {
  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
  };
  reader.readAsDataURL(file);
}

// Handle AI messages with delay
function showMessagesSequentially(callback) {
  aiMessages.innerHTML = "";
  let i = 0;
  function nextMessage() {
    if (i < coolMessages.length) {
      aiMessages.innerHTML = `<p>${coolMessages[i]}</p>`;
      i++;
      setTimeout(nextMessage, 1000);
    } else {
      callback();
    }
  }
  nextMessage();
}

// Handle form submission
form.addEventListener("submit", e => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) {
    alert("Please upload an image first!");
    return;
  }

  showPreview(file);
  result.innerHTML = "";
  showMessagesSequentially(() => {
    const formData = new FormData();
    formData.append("file", file);

    fetch("/predict", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        aiMessages.innerHTML = "";
        result.innerHTML = `
          <p>${data.label} (${data.confidence.toFixed(2)}%)</p>
          <div style="background:#eee;border-radius:8px;overflow:hidden;width:80%;margin:auto;">
            <div style="width:${data.confidence}%;background:${data.label.includes("Cat") ? "#ff6b6b" : "#4dabf7"};padding:6px 0;color:white;">
              ${data.confidence.toFixed(2)}%
            </div>
          </div>
        `;
      });
  });
});

// Drag & Drop
dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", e => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) {
    fileInput.files = e.dataTransfer.files;
    showPreview(file);
  }
});

// Paste support
document.addEventListener("paste", e => {
  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const file = items[i].getAsFile();
      fileInput.files = new DataTransfer().files;
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      showPreview(file);
      break;
    }
  }
});
