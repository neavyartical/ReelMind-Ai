const API = "https://reelmindbackend-1.onrender.com";

/* =========================
   HELPERS
========================= */
function el(id) {
  return document.getElementById(id);
}

/* =========================
   RENDER SINGLE POST
========================= */
function renderPost(video) {
  const media =
    video.mediaType === "image"
      ? `<img src="${video.mediaUrl}" class="feed-media" alt="Post">`
      : `<video controls playsinline class="feed-media" src="${video.mediaUrl}"></video>`;

  return `
    <div class="feed-card">
      ${media}

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
}

/* =========================
   LOAD FEED
========================= */
export async function loadFeed() {
  try {
    const res = await fetch(`${API}/videos`);
    const data = await res.json();

    const feed = el("videoFeed");
    if (!feed) return;

    feed.innerHTML = "";

    const videos = data.videos || [];

    if (!videos.length) {
      feed.innerHTML = `
        <div class="card">
          No posts available
        </div>
      `;
      return;
    }

    videos.forEach(video => {
      feed.innerHTML += renderPost(video);
    });
  } catch (error) {
    console.log("Feed load error:", error);

    const feed = el("videoFeed");
    if (feed) {
      feed.innerHTML = `
        <div class="card">
          Failed to load feed
        </div>
      `;
    }
  }
}

/* =========================
   LIKE POST
========================= */
export async function likePost(id) {
  try {
    await fetch(`${API}/videos/like/${id}`, {
      method: "POST"
    });

    await loadFeed();
  } catch (error) {
    console.log("Like error:", error);
  }
}

/* =========================
   SHARE POST
========================= */
export async function sharePost(url) {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "ReelMind AI",
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied");
    }
  } catch (error) {
    console.log("Share error:", error);
  }
}

/* =========================
   AUTO REFRESH
========================= */
export function startFeedAutoRefresh() {
  setInterval(() => {
    loadFeed();
  }, 30000);
}

/* =========================
   GLOBAL BINDINGS
========================= */
window.likePost = likePost;
window.sharePost = sharePost;
