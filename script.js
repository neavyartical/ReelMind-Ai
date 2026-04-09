console.log("SCRIPT LOADED ✅");

const BACKEND_URL = "https://backend-ppyz.onrender.com";

async function generate() {
  console.log("🔥 Button clicked");

  const prompt = document.getElementById("prompt").value;
  const status = document.getElementById("status");
  const img = document.getElementById("video");

  if (!prompt) {
    alert("Enter a prompt!");
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

    // 🔥 THIS IS THE IMPORTANT DEBUG POPUP
    alert("STATUS: " + res.status + " | DATA: " + JSON.stringify(data));

    console.log("📦 Response:", data);

    if (data.video) {
      status.innerText = "Done ✅";
      img.src = data.video;
      img.style.display = "block";
    } else {
      status.innerText = "Failed ❌";
    }

  } catch (err) {
    console.error("❌ ERROR:", err);
    alert("ERROR: " + err.message);
    status.innerText = "Server waking up... try again 🔁";
  }
}
