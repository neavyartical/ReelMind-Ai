const API = "https://reelmindbackend-1.onrender.com";

async function generate(type) {
  const prompt = document.getElementById("prompt").value;

  if (!prompt) {
    alert("Enter something first!");
    return;
  }

  try {
    const res = await fetch(API + "/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, type })
    });

    const data = await res.json();
    display(data);

  } catch (err) {
    console.error(err);
    document.getElementById("result").innerHTML = "❌ Error generating";
  }
}

async function askAI() {
  const question = document.getElementById("prompt").value;

  if (!question) {
    alert("Ask something!");
    return;
  }

  try {
    const res = await fetch(API + "/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await res.json();
    document.getElementById("result").innerHTML = `<p>${data.answer}</p>`;

  } catch (err) {
    console.error(err);
    document.getElementById("result").innerHTML = "❌ AI error";
  }
}

function display(data) {
  let html = "";

  if (data.story) html += `<p>${data.story}</p>`;
  if (data.image) html += `<img src="${data.image}" />`;
  if (data.video) html += `<p>${data.video}</p>`;

  document.getElementById("result").innerHTML = html;
}

function downloadResult() {
  const text = document.getElementById("result").innerText;

  if (!text) {
    alert("Nothing to download");
    return;
  }

  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "reelmind.txt";
  a.click();
}
