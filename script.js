console.log("SCRIPT LOADED ✅");

const BACKEND_URL = "https://backend-ppyz.onrender.com";

async function generate() {
  console.log("🔥 Button clicked");

  const prompt = document.getElementById("prompt").value;
  const status = document.getElementById("status");
  const img = document.getElementById("video");

  if (!prompt) {
    alert("Please enter a prompt!");
    return;
  }

  status.innerText = "Generating... ⏳";
  img.style.display = "none";

  try {
    console.log("📡 Sending request...");

    const res = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    console.log("📡 Response status:", res.status);

    const data = await res.json();
    console.log("📦 Full response:", data);

    // DEBUG POPUP (very important)
    alert("Response: " + JSON.stringify(data));

    if (data.video) {
      console.log("✅ Image received");

      status.innerText = "Done ✅";

      img.src = data.video;
      img.style.display = "block";
    } else {
      console.log("❌ No video field");

      status.innerText = "Failed ❌";
    }

  } catch (error) {
    console.error("❌ ERROR:", error);

    status.innerText = "Error ❌ (check console)";
  }
}
