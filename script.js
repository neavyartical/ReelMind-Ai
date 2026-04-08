const BACKEND_URL = "https://backend-ppyz.onrender.com";

async function generate() {
  const prompt = document.getElementById("prompt").value;

  console.log("🔥 Button clicked");
  document.getElementById("status").innerText = "Generating...";

  try {
    const res = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

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
    document.getElementById("status").innerText = "Error ❌";
  }
}
