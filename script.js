const BACKEND_URL = "https://backend-ppyz.onrender.com";

async function generate() {
  const prompt = document.getElementById("prompt").value;

  console.log("🔥 Button clicked");
  document.getElementById("status").innerText = "Generating...";

  try {
    console.log("📡 Sending request...");

    const res = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    console.log("📡 Response status:", res.status);

    const text = await res.text();
    console.log("📦 Raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("❌ Not JSON:", text);
      document.getElementById("status").innerText = "Server Error ❌";
      return;
    }

    console.log("✅ Parsed:", data);

    if (data.video) {
      document.getElementById("status").innerText = "Done ✅";

      const video = document.getElementById("video");
      video.src = data.video;
      video.style.display = "block";
    } else {
      document.getElementById("status").innerText = "Failed ❌";
    }

  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    document.getElementById("status").innerText = "Connection Error ❌";
  }
}
