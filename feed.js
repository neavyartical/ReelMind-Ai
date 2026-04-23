/* =========================
   FEED MODULE
========================= */
import { API, socket, el } from "./script.js";

/* =========================
   RENDER POST
========================= */
function renderPost(video) {
  const media =
    video.mediaType === "image"
      ? `
        <img
          src="${video.mediaUrl}"
          class="feed-media"
          alt="Post"
        >
      `
      : `
        <video
          class="feed-media"
          src="${video.mediaUrl}"
          controls
          playsinline
          muted
          loop
        ></video>
      `;

  return `
    <div class="feed-card" data-id="${video._id}">
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
    const response = await fetch(`${API}/videos`);
    const data = await response.json();

    const feed = el("videoFeed");
    if (!feed) return;

    const videos = data.videos || [];

    if (!videos.length) {
      feed.innerHTML = `
        <div class="card">
          No posts available
        </div>
      `;
      return;
    }

    feed.innerHTML = videos
      .map(video => renderPost(video))
      .join("");

    enableAutoPlay();
  } catch (error) {
    console.log("Feed error:", error);

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

    socket.emit("like-post", {
      postId: id
    });

    loadFeed();
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
        text: "Check this post",
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
   AUTO PLAY VISIBLE VIDEOS
========================= */
function enableAutoPlay() {
  const videos = document.querySelectorAll(".feed-media");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const media = entry.target;

        if (media.tagName !== "VIDEO") return;

        if (entry.isIntersecting) {
          media.play().catch(() => {});
        } else {
          media.pause();
        }
      });
    },
    {
      threshold: 0.7
    }
  );

  videos.forEach(video => {
    observer.observe(video);
  });
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
   SOCKET EVENTS
========================= */
socket.on("feed-new-post", loadFeed);
socket.on("feed-post-liked", loadFeed);
socket.on("feed-new-comment", loadFeed);

/* =========================
   GLOBAL BINDINGS
========================= */
window.likePost = likePost;
window.sharePost = sharePost;
