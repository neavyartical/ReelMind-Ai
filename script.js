async function generate(type) {
  const prompt = document.getElementById("prompt").value;
  const result = document.getElementById("result");

  if (!prompt) {
    result.innerHTML = "⚠️ Please enter something";
    return;
  }

  result.innerHTML = "⏳ Generating...";

  try {
    const res = await fetch("https://reelmindbackend-1.onrender.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, type })
    });

    const data = await res.json();

    if (type === "image") {
      result.innerHTML = `<img src="${data.output}" />`;
    } else {
      result.innerHTML = `<p>${data.output}</p>`;
    }

  } catch (err) {
    result.innerHTML = "❌ Error generating";
  }
}

/* ASK AI */
function askAI() {
  generate("all");
}

/* DOWNLOAD */
function downloadResult() {
  const content = document.getElementById("result").innerText;

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "reelmind.txt";
  link.click();
}
