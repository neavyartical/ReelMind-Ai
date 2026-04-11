const API = "https://reelmindbackend-1.onrender.com";

async function generate(type) {
  const input = document.getElementById("prompt").value;
  const resultBox = document.getElementById("result");
  const imageBox = document.getElementById("imageBox");

  resultBox.innerHTML = "⚡ Generating...";
  imageBox.innerHTML = "";

  let endpoint = "";

  if (type === "text") endpoint = "/generate-text";
  if (type === "image") endpoint = "/generate-image";
  if (type === "video") endpoint = "/generate-video";

  const res = await fetch(API + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: input })
  });

  const data = await res.json();

  if (data.image) {
    imageBox.innerHTML = `
      <img src="${data.image}" class="generated-img"/>
      <a href="${data.image}" download class="download-btn">Download</a>
    `;
    document.body.style.backgroundImage = `url(${data.image})`;
    return;
  }

  resultBox.innerHTML = data.result;
}
