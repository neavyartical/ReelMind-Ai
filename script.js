const API_URL = "https://backend-ppyz.onrender.com/generate";

async function generateImage() {
  const prompt = document.getElementById("prompt").value;
  const status = document.getElementById("status");
  const image = document.getElementById("outputImage");

  if (!prompt) {
    alert("Please enter a prompt");
    return;
  }

  status.innerText = "Generating image... ⏳";
  image.style.display = "none";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt
      })
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    image.src = imageUrl;
    image.style.display = "block";
    status.innerText = "✅ Image generated!";

  } catch (error) {
    console.error(error);
    status.innerText = "❌ Error generating image";
  }
}
