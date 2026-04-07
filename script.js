async function generateImage() {
  const prompt = document.getElementById("prompt").value;

  const response = await fetch("https://backend-ppyz.onrender.com/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt
    })
  });

  if (!response.ok) {
    alert("Error generating image");
    return;
  }

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);

  document.getElementById("output").src = imageUrl;
}
