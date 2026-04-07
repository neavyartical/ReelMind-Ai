const API_URL = "https://backend-ppyz.onrender.com/generate";

async function generateVideo() {
  const prompt = document.getElementById("prompt").value;

  if (!prompt) {
    alert("Please enter a prompt");
    return;
  }

  const resultBox = document.getElementById("result");
  resultBox.innerHTML = "Generating... ⏳";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (data.video) {
      resultBox.innerHTML = `
        <video controls width="100%">
          <source src="${data.video}" type="video/mp4">
        </video>
      `;
    } else {
      resultBox.innerHTML = "❌ Failed to generate video";
    }

  } catch (error) {
    resultBox.innerHTML = "⚠️ Error connecting to backend";
    console.error(error);
  }
}
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
