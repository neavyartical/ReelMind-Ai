/* =========================
   FEED FUNCTIONS
========================= */

const API = "https://reelmindbackend-1.onrender.com";

function el(id) {
  return document.getElementById(id);
}

/* =========================
   LOAD FEED
========================= */
window.loadFeed = async () => {
  try {
    const res = await fetch(`${API}/videos`);
    const data = await res.json();

    const feed = el("videoFeed");
    if (!feed) return;

    feed.innerHTML = "";

    (data.videos || []).forEach(video => {
      feed.innerHTML += `
        <div class="feed-card">
          ${
            video.mediaType === "image"
              ? `<img src="${video.mediaUrl}" class="feed-media">`
              : `<video controls playsinline class="feed-media" src="${video.mediaUrl}"></video>`
          }

          <div class="feed-user">
            <h4>${video.username || "User"}</h4>
            <p>${video.caption || ""}</p>
          </div>

          <div class="feed-actions">
            <button onclick="likePost('${video._id}')">
              ❤️ ${video.likes || 0}
            </button>

            <button onclick="sharePost('${video.mediaUrl}')">
              📤 Share
            </button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.log("Feed load error:", error);
  }
};

/* =========================
   LIKE POST
========================= */
window.likePost = async (id) => {
  try {
    await fetch(`${API}/videos/like/${id}`, {
      method: "POST"
    });

    loadFeed();
  } catch (error) {
    console.log("Like error:", error);
  }
};

/* =========================
   SHARE POST
========================= */
window.sharePost = async (url) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "ReelMind AI",
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied");
    }
  } catch (error) {
    console.log("Share error:", error);
  }
};
