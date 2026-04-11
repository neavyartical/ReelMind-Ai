const OPENROUTER_API_KEY = "PASTE_YOUR_OPENROUTER_KEY_HERE";

async function generate() {
  const prompt = document.getElementById("prompt").value.trim();
  const output = document.getElementById("output");

  if (!prompt) {
    output.innerHTML = "⚠️ Please enter something";
    return;
  }

  output.innerHTML = "⏳ Generating... please wait";

  try {
    /* ================= TEXT (AI STORY) ================= */
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    let story = "⚠️ No story generated";
    if (data.choices && data.choices.length > 0) {
      story = data.choices[0].message.content;
    }

    /* ================= IMAGE ================= */
    const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(prompt)}`;

    /* ================= DISPLAY ================= */
    output.innerHTML = `
      <h3>📝 Story</h3>
      <p>${story}</p>

      <h3>🖼 Image</h3>
      <img src="${imageUrl}" alt="Generated Image">

      <br>
      <a href="${imageUrl}" download>
        <button class="download-btn">Download Image</button>
      </a>

      <h3>🎬 Video (Demo)</h3>
      <video controls>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
      </video>
    `;

  } catch (error) {
    output.innerHTML = "❌ Error: " + error.message;
  }
}
