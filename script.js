async function generate() {
  const prompt = document.getElementById("prompt").value;

  const status = document.getElementById("status");
  const result = document.getElementById("result");

  status.innerText = "Generating...";
  result.innerHTML = "";

  try {
    const res = await fetch("https://backend-ppyz.onrender.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    console.log(data);

    if (data.url) {
      status.innerText = "Done ✅";

      result.innerHTML = `
        <img src="${data.url}" style="max-width:100%; border-radius:10px;" />
      `;
    } else {
      status.innerText = "Error ❌";
      result.innerText = JSON.stringify(data);
    }

  } catch (err) {
    status.innerText = "Failed ❌";
    console.error(err);
  }
}
