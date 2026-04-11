// ===============================
// CONFIG
// ===============================
const API_URL = "https://reelmindbackend-1.onrender.com";

// ===============================
// GENERATE FUNCTION
// ===============================
async function generate(type = "all") {
  const prompt = document.getElementById("prompt").value;
  const resultDiv = document.getElementById("result");

  if (!prompt) {
    alert("Please enter something!");
    return;
  }

  resultDiv.innerHTML = "⏳ Generating...";

  try {
    const res = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, type }),
    });

    const data = await res.json();

    // CLEAR RESULT FIRST
    resultDiv.innerHTML = "";

    // ===============================
    // HANDLE STORY ONLY
    // ===============================
    if (type === "story") {
      resultDiv.innerHTML = `<p>${data.text || "No story generated"}</p>`;
      return;
    }

    // ===============================
    // HANDLE IMAGE
    // ===============================
    if (type === "image") {
      if (data.image) {
        resultDiv.innerHTML = `<img src="${data.image}" style="max-width:100%; border-radius:10px;">`;
      } else {
        resultDiv.innerHTML = "❌ No image generated";
      }
      return;
    }

    // ===============================
    // HANDLE VIDEO
    // ===============================
    if (type === "video") {
      if (data.video) {
        resultDiv.innerHTML = `
          <video controls style="max-width:100%; border-radius:10px;">
            <source src="${data.video}" type="video/mp4">
          </video>
        `;
      } else {
        resultDiv.innerHTML = "❌ No video generated";
      }
      return;
    }

    // ===============================
    // HANDLE ALL (DEFAULT)
    // ===============================
    let output = "";

    if (data.text) {
      output += `<p>${data.text}</p>`;
    }

    if (data.image) {
      output += `<img src="${data.image}" style="max-width:100%; border-radius:10px;">`;
    }

    if (data.video) {
      output += `
        <video controls style="max-width:100%; border-radius:10px;">
          <source src="${data.video}" type="video/mp4">
        </video>
      `;
    }

    resultDiv.innerHTML = output;

  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "❌ Error connecting to server";
  }
}

// ===============================
// ASK AI
// ===============================
async function askAI() {
  const prompt = document.getElementById("prompt").value;
  const resultDiv = document.getElementById("result");

  if (!prompt) {
    alert("Ask something!");
    return;
  }

  resultDiv.innerHTML = "🤖 Thinking...";

  try {
    const res = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    resultDiv.innerHTML = `<p>${data.reply || "No response"}</p>`;

  } catch (error) {
    resultDiv.innerHTML = "❌ Error connecting to AI";
  }
}

// ===============================
// DOWNLOAD FUNCTION
// ===============================
function downloadResult() {
  const content = document.getElementById("result").innerText;

  if (!content) {
    alert("Nothing to download!");
    return;
  }

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "reelmind-output.txt";
  link.click();
}
