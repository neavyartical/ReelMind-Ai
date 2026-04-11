async function generate(type) {
  const prompt = document.getElementById("prompt").value;
  const resultDiv = document.getElementById("result");

  if (!prompt) {
    resultDiv.innerHTML = "❌ Enter something first";
    return;
  }

  resultDiv.innerHTML = "⏳ Generating...";

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, type })
    });

    const data = await res.json();

    if (type === "image") {
      resultDiv.innerHTML = `<img src="${data.result}" />`;
    } else {
      resultDiv.innerHTML = `<p>${data.result}</p>`;
    }

  } catch (err) {
    resultDiv.innerHTML = "❌ Error connecting to server";
  }
}
