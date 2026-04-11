const API_URL = "https://reelmindbackend-1.onrender.com";

/* GENERATE */
async function generate(type) {
  const prompt = document.getElementById("prompt").value;
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "⏳ Generating...";

  const res = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, type }),
  });

  const data = await res.json();

  let output = "";

  if (data.story) {
    output += `<p>${data.story}</p>`;
  }

  if (data.image) {
    output += `<img src="${data.image}" width="100%" />`;
  }

  if (data.video) {
    output += `<video src="${data.video}" controls width="100%"></video>`;
  }

  resultDiv.innerHTML = output;
}

/* ASK AI */
async function askAI() {
  const question = document.getElementById("prompt").value;
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "⏳ Thinking...";

  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const data = await res.json();
  resultDiv.innerHTML = `<p>${data.answer}</p>`;
}

/* DOWNLOAD */
function downloadResult() {
  const text = document.getElementById("result").innerText;
  const blob = new Blob([text], { type: "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "reelmind.txt";
  a.click();
}
