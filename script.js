const API_URL = "https://reelmindbackend-1.onrender.com/generate";

async function process(type) {
    const input = document.getElementById('userInput').value;
    const output = document.getElementById('output-window');
    
    if(!input) return alert("Please enter your prompt!");
    
    output.innerHTML = "<p style='color: #00d4ff;'>🧊 ReelMind AI is processing... (Free tier may take 50s to wake up)</p>";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ action: type, input: input })
        });
        
        const result = await response.json();
        
        if(result.type === 'text') {
            output.innerHTML = `<div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:10px;">${result.data}</div>`;
        } else if(result.type === 'image') {
            output.innerHTML = `<img src="${result.data}" style="width:100%; border-radius:15px; border:2px solid #00d4ff;">
                                <a href="${result.data}" target="_blank" class="solver-btn" style="display:block; margin-top:10px; text-align:center; text-decoration:none;">Preview / Download 4K</a>`;
        } else if(result.type === 'video') {
            output.innerHTML = `<video controls style="width:100%; border-radius:15px;"><source src="${result.data}"></video>`;
        }
    } catch (err) {
        output.innerHTML = "<p style='color:red;'>System Timeout. The server is waking up, please try again in 30 seconds.</p>";
    }
}
