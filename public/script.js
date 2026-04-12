async function generate(type) {
  const prompt = document.getElementById("prompt").value;
  const result = document.getElementById("result");

  if (!prompt) {
    result.innerHTML = "❌ Enter something first";
    return;
  }

  result.innerHTML = "⏳ Generating...";

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, type })
    });

    const data = await res.json();
    result.innerHTML = data.result;

  } catch (error) {
    result.innerHTML = "❌ Server error";
  }
}

function askAI() {
  document.getElementById("result").innerHTML =
    "🤖 AI assistant coming soon...";
}

function downloadResult() {
  const text = document.getElementById("result").innerText;

  if (!text) {
    alert("Nothing to download!");
    return;
  }

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "result.txt";
  link.click();
}
