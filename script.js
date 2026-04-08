const BACKEND_URL = "https://backend-ppyz.onrender.com";

async function generate() {
  const prompt = document.getElementById("prompt").value;

  console.log("🔥 Button clicked");
  document.getElementById("status").innerText = "Generating...";

  try {
    console.log("📡 Sending request...");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    console.log("📡 Response status:", res.status);

    const data = await res.json();

    console.log("📦 Response:", data);

    if (data.video) {
      document.getElementById("status").innerText = "Done ✅";

      const video = document.getElementById("video");
      video.src = data.video;
      video.style.display = "block";
    } else {
      document.getElementById("status").innerText = "Failed ❌";
    }

  } catch (err) {
    console.error("❌ ERROR:", err);
    document.getElementById("status").innerText = "Server waking up... try again 🔁";
  }
}
