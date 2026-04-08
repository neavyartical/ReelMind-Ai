const BACKEND_URL = "https://backend-ppyz.onrender.com";

async function generate() {
  console.log("🔥 Button clicked");

  const prompt = document.getElementById("prompt").value;
  const status = document.getElementById("status");
  const img = document.getElementById("video");

  status.innerText = "Generating...";

  try {
    console.log("📡 Sending request...");

    const res = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    console.log("📡 Status:", res.status);

    const data = await res.json();
    console.log("📦 Data:", data);

    if (data.video) {
      status.innerText = "Done ✅";

      img.src = data.video;
      img.style.display = "block";
    } else {
      status.innerText = "Failed ❌";
    }

  } catch (err) {
    console.error("❌ ERROR:", err);
    status.innerText = "Error ❌";
  }
}
