const API_URL = "https://reelmind-ai.onrender.com/generate"; // ✅ REPLACE if your link is different

async function generate() {
  const prompt = document.getElementById("prompt").value;
  const result = document.getElementById("result");

  if (!prompt) {
    result.innerText = "Enter a prompt first";
    return;
  }

  result.innerText = "Generating...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    // 🔥 check if server responded
    if (!res.ok) {
      throw new Error("Server not responding");
    }

    const data = await res.json();

    result.innerText = data.result || "No response";

  } catch (err) {
    console.error("ERROR:", err);
    result.innerText = "Backend not connected ❌";
  }
}
