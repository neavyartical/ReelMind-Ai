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
    const res = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    // 🔥 DEBUG POPUP (KEEP THIS)
    alert("STATUS: " + res.status + " | DATA: " + JSON.stringify(data));

    if (data.video) {
      status.innerText = "Done ✅";
      img.src = data.video;
      img.style.display = "block";
    } else {
      status.innerText = "Failed ❌";
    }

  } catch (err) {
    alert("ERROR: " + err.message);
    status.innerText = "Server waking up... try again 🔁";
  }
}
