const API_KEY = "YOUR_HF_API_KEY";

function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
  document.getElementById(tab).classList.remove("hidden");
}

async function generateStory() {
  let input = document.getElementById("storyInput").value;

  let response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: `Create a viral emotional story with hook, suspense and ending: ${input}`
    })
  });

  let data = await response.json();
  document.getElementById("storyOutput").innerText =
    data[0]?.generated_text || "Error";
}

async function generateScene() {
  let input = document.getElementById("sceneInput").value;

  let response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: `Create a cinematic scene with camera angles, lighting and emotions: ${input}`
    })
  });

  let data = await response.json();
  document.getElementById("sceneOutput").innerText =
    data[0]?.generated_text || "Error";
}

async function generateVideo() {
  let input = document.getElementById("videoInput").value;

  let response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: `Break this into a short cinematic video with scenes, shots and transitions: ${input}`
    })
  });

  let data = await response.json();
  document.getElementById("videoOutput").innerText =
    data[0]?.generated_text || "Error";
}
