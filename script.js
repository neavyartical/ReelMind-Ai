async function generate() {
  const prompt = document.getElementById("prompt").value;
  const result = document.getElementById("result");

  if (!prompt) {
    result.innerText = "Enter a prompt first";
    return;
  }

  result.innerText = "Generating...";

  try {
    const res = await fetch("https://YOUR-APP.onrender.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    result.innerText = data.result || "No response";

  } catch (err) {
    console.error(err);
    result.innerText = "Connection error ❌";
  }
}
