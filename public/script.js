// MAIN GENERATE FUNCTION
function generate(type) {
  const prompt = document.getElementById("prompt").value;
  const result = document.getElementById("result");

  if (!prompt) {
    result.innerHTML = "<p style='color:red;'>❌ Please enter something first</p>";
    return;
  }

  result.innerHTML = "<p>⏳ Generating...</p>";

  setTimeout(() => {
    if (type === "story") {
      result.innerHTML = `
        <h3>📖 Story</h3>
        <p>Once upon a time, ${prompt} turned into something amazing...</p>
      `;
    } 
    else if (type === "image") {
      result.innerHTML = `
        <h3>🖼 Image</h3>
        <img src="https://picsum.photos/400/300">
      `;
    } 
    else if (type === "video") {
      result.innerHTML = `
        <h3>🎬 Video Idea</h3>
        <p>Create a viral video about "${prompt}"</p>
      `;
    } 
    else {
      result.innerHTML = `
        <h3>✨ AI Result</h3>
        <p>${prompt} can go viral!</p>
      `;
    }
  }, 1500);
}
