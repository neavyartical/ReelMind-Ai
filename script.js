async function generateVideo() {
  const prompt = document.getElementById("prompt").value;
  const status = document.getElementById("status");
  const video = document.getElementById("video");

  if (!prompt) {
    alert("Enter a prompt");
    return;
  }

  status.innerText = "Generating... ⏳";

  try {
    const response = await fetch("https://backend-ppyz.onrender.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (data.video) {
      video.src = data.video;
      status.innerText = "Done ✅";
    } else {
      status.innerText = "Failed ❌";
      console.log(data);
    }

  } catch (error) {
    console.error(error);
    status.innerText = "Error ❌";
  }
}
