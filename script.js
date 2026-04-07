<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ReelMind AI</title>
  <style>
    body {
      font-family: Arial;
      text-align: center;
      background: #0f172a;
      color: white;
      padding: 20px;
    }
    input, button {
      padding: 10px;
      margin: 10px;
      width: 80%;
      max-width: 400px;
      border-radius: 8px;
      border: none;
    }
    button {
      background: #22c55e;
      color: white;
      cursor: pointer;
    }
    img {
      margin-top: 20px;
      max-width: 90%;
      border-radius: 10px;
    }
  </style>
</head>
<body>

  <h1>🎬 ReelMind AI</h1>

  <input type="text" id="prompt" placeholder="Enter your prompt..." />
  <br>
  <button onclick="generateImage()">Generate</button>

  <br>
  <img id="outputImage" />

  <script>
    async function generateImage() {
      const prompt = document.getElementById("prompt").value;

      if (!prompt) {
        alert("Please enter a prompt");
        return;
      }

      try {
        const response = await fetch("https://backend-ppyz.onrender.com/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: prompt
          })
        });

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        document.getElementById("outputImage").src = imageUrl;

      } catch (error) {
        alert("Error generating image");
        console.error(error);
      }
    }
  </script>

</body>
</html>      inputs: `Create a cinematic scene with camera angles, lighting and emotions: ${input}`
    })
  });

  let data = await response.json();
  document.getElementById("sceneOutput").innerText =
    data[0]?.generated_text || "Error";
}

async function generateVideo() {
  let input = document.getElementById("videoInput").value;

  let response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: `Break this into a short cinematic video with scenes, shots and transitions: ${input}`
    })
  });

  let data = await response.json();
  document.getElementById("videoOutput").innerText =
    data[0]?.generated_text || "Error";
}
