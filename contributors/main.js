/* ============================================================
   Lingua Roots – main.js
   Handles: post rendering, likes (session-safe), comments,
   image carousel/lightbox, video, and custom audio player.
   ============================================================ */

// ── CONFIG ──────────────────────────────────────────────────
// const API_BASE = 'http://localhost:8765';
const API_BASE = 'https://api.linguaroots.publicvm.com';

// Session-scoped like tracking (prevents duplicate likes on refresh)
const likedPosts = new Set(
  JSON.parse(sessionStorage.getItem('lr_liked') || '[]')
);

// In-memory comment store keyed by postId (supplements server data)
const localComments = {};

// Active comment modal state
let activePostId = null;

// Lightbox state
let lbImages = [];
let lbIndex  = 0;

// ── DEMO DATA (used when API is unavailable) ─────────────────
const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=70',
];

const DEMO_POSTS = [
  { postId: 1, type: 'IMAGE',  title: 'The Coastal Ngondo Festival', content: 'A major annual water-centered festival of the Sawa people, featuring rituals, ceremonies, and communion with water spirits.', images: [DEMO_PHOTOS[0], DEMO_PHOTOS[1]], likes: 42, comments: [] },
  { postId: 2, type: 'STORY',  title: 'The Tortoise and the Sky',    content: 'Long ago, the tortoise wished to attend the great feast in the sky. All the birds lent him feathers — but pride made him fall.', images: [DEMO_PHOTOS[2]], likes: 17, comments: [] },
  { postId: 3, type: 'VIDEO',  title: 'Bamileke War Dance',          content: 'Witness the powerful footwork and rhythmic drumming of the Bamileke warriors in this rare cultural performance.', video: '', likes: 88, comments: [] },
  { postId: 4, type: 'RIDDLE', title: 'Can You Solve This?',         content: 'I have cities but no houses, mountains but no trees, water but no fish, and roads but no cars. What am I?', images: [DEMO_PHOTOS[3]], likes: 33, comments: [{ id: 'c1', author: 'Amara', text: 'A map!', ts: Date.now() - 3600000 }] },
  { postId: 5, type: 'AUDIO',  title: 'Ewondo Proverb',              content: '"Mfan a mbot a si zam." — A child who is not taught will not know. Traditional wisdom passed through generations.', image: DEMO_PHOTOS[4], audio: '', likes: 55, comments: [] },
  { postId: 6, type: 'IMAGE',  title: 'Bamum Royal Palace',          content: 'The magnificent Bamum Sultan\'s Palace in Foumban, a UNESCO heritage site that holds centuries of Bamum history and art.', images: [DEMO_PHOTOS[5], DEMO_PHOTOS[0], DEMO_PHOTOS[1]], likes: 71, comments: [] },
];

// ── DATA FETCHING ────────────────────────────────────────────
async function fetchPosts() {
  try {
    const res = await fetch(`${API_BASE}/post/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API unavailable, using demo posts:', err.message);
    return DEMO_POSTS;
  }
}

// ── LIKE PERSISTENCE ─────────────────────────────────────────
function saveLiked() {
  sessionStorage.setItem('lr_liked', JSON.stringify([...likedPosts]));
}

  function getAnonymousId() {

    let anonymousId = localStorage.getItem("anonymousId");

    if (!anonymousId) {

      anonymousId = crypto.randomUUID();

      localStorage.setItem("anonymousId", anonymousId);
    }

   return anonymousId;
  }

  function getGuestUsername() {

    let username = localStorage.getItem("guestUsername");

    if (!username) {

      username = prompt("Enter your display name:");

      if (!username || username.trim() === "") {

        username = "Guest_" + Math.floor(Math.random() * 10000);
      }

      localStorage.setItem("guestUsername", username);
    }

    return username;
  }

  async function toggleLike(postId) {

    const anonymousId = getAnonymousId();

    try {
      const response = await fetch(
          `${this.API_BASE}/like`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              postId: postId,
              anonymousId: anonymousId
            })
          }
      );

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      await loadPostLikes(postId);

    } catch (error) {

      console.error(error);
    }
  }

  async function loadPostLikes(postId) {

    const anonymousId = getAnonymousId();

    try {
      const response = await fetch(
          `http://localhost:8092/post/${postId}/likes?anonymousId=${anonymousId}`
      );
      const data = await response.json();

      document.getElementById(`like-count-${postId}`)
          .innerText = data.likes;

      const button =
          document.getElementById(`like-btn-${postId}`);

      if (data.isLiked) {
        button.innerText = "Liked";
      } else {
        button.innerText = "Like";
      }

    } catch (error) {
      console.error(error);
    }
  }

// ── LIKE HANDLER ─────────────────────────────────────────────
async function handleLike(postId, btn, countEl) {
  const id = String(postId);
  const alreadyLiked = likedPosts.has(id);

  // Optimistic UI update
  const current = parseInt(countEl.textContent, 10) || 0;
  if (alreadyLiked) {
    likedPosts.delete(id);
    btn.classList.remove('liked');
    countEl.textContent = Math.max(0, current - 1);
  } else {
    likedPosts.add(id);
    btn.classList.add('liked');
    countEl.textContent = current + 1;
    btn.classList.add('pop');
    setTimeout(() => btn.classList.remove('pop'), 400);
  }
  saveLiked();

  // Sync with server (non-blocking)
  try {
    const endpoint = alreadyLiked ? 'unlike' : 'like';
    const anonymousId = getAnonymousId();
    await fetch(`${API_BASE}/like/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        postId: postId,
        anonymousId: anonymousId
      })
    });
  } catch (_) { /* silent — optimistic state is already applied */ }
}

// ── COMMENT MODAL ────────────────────────────────────────────
const modal      = document.getElementById('commentModal');
const modalClose = document.getElementById('modalClose');
const commentsList = document.getElementById('commentsList');
const commentInput = document.getElementById('commentInput');
const commentSubmit = document.getElementById('commentSubmit');

function openComments(postId, initialComments) {
  activePostId = postId;
  localComments[postId] = localComments[postId] || [...(initialComments || [])];
  renderComments(postId);
  modal.classList.add('open');
  commentInput.focus();
}

function closeComments() {
  modal.classList.remove('open');
  activePostId = null;
}

function renderComments(postId) {

  const list = localComments[postId] || [];

  if (!list.length) {
    commentsList.innerHTML = `
      <p class="no-comments">
        No comments yet. Be the first!
      </p>
    `;
    return;
  }

  commentsList.innerHTML = list.map(comment => `
    <div class="comment-item">
      <div class="comment-avatar">
        ${(comment.username || 'A')[0].toUpperCase()}
      </div>
      <div class="comment-body">
        <span class="comment-author">
          ${escHtml(comment.username || 'Anonymous')}
        </span>
        <span class="comment-time">
          ${timeAgo(comment.datePublished)}
        </span>
        <p class="comment-text">
          ${escHtml(comment.content)}
        </p>
      </div>
    </div>

  `).join('');
  commentsList.scrollTop = commentsList.scrollHeight;
}

async function submitComment() {

  const text = commentInput.value.trim();

  if (!text || !activePostId) return;

  // Get/Create anonymous ID
  let anonymousId = localStorage.getItem('anonymousId');

  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem('anonymousId', anonymousId);
  }

  // Get/Create guest username
  let guestUsername = localStorage.getItem('guestUsername');

  if (!guestUsername) {
    guestUsername = prompt('Enter your display name');
    if (!guestUsername || guestUsername.trim() === '') {
      guestUsername = `Guest_${Math.floor(Math.random() * 10000)}`;
    }

    localStorage.setItem('guestUsername', guestUsername);
  }

  // Local UI comment object
  const comment = {
    commentId: `c${Date.now()}`,   // temporary frontend id
    username: guestUsername,
    content: text,
    datePublished: new Date().toISOString(),
    isLiked: false
  };

  // Store locally
  localComments[activePostId] =
      localComments[activePostId] || [];

  localComments[activePostId].push(comment);

  // Clear input
  commentInput.value = '';

  // Re-render comments
  renderComments(activePostId);

  // Update comment badge
  const countEl = document.querySelector(
      `.post-card[data-id="${activePostId}"] .comment-count`
  );

  if (countEl) {

    countEl.textContent =
        localComments[activePostId].length;
  }

  // Sync with backend
  try {

    const response = await fetch(
        `${API_BASE}/comment/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: text,
            anonymousId: anonymousId,
            guestUsername: guestUsername,
            postId: activePostId
          }),
        }
    );
    renderComments(activePostId);
    if (!response.ok) {
      throw new Error('Failed to save comment');
    }

  } catch (error) {
    console.error(error);
  }
}

modalClose.addEventListener('click', closeComments);
modal.addEventListener('click', e => { if (e.target === modal) closeComments(); });
commentSubmit.addEventListener('click', submitComment);
commentInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeComments(); });

// ── LIGHTBOX ─────────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbDots   = document.getElementById('lbDots');

function openLightbox(images, startIndex) {
  lbImages = images;
  lbIndex  = startIndex || 0;
  updateLightbox();
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open');
}

function updateLightbox() {
  lbImg.src = lbImages[lbIndex];
  lbDots.innerHTML = lbImages.map((_, i) =>
    `<span class="lb-dot${i === lbIndex ? ' active' : ''}"></span>`
  ).join('');
  document.getElementById('lbPrev').style.display = lbImages.length > 1 ? '' : 'none';
  document.getElementById('lbNext').style.display = lbImages.length > 1 ? '' : 'none';
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => {
  lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
  updateLightbox();
});
document.getElementById('lbNext').addEventListener('click', () => {
  lbIndex = (lbIndex + 1) % lbImages.length;
  updateLightbox();
});
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; updateLightbox(); }
  if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; updateLightbox(); }
  if (e.key === 'Escape')     closeLightbox();
});

// ── MEDIA BUILDERS ───────────────────────────────────────────

/** Builds an image gallery (single or multi with carousel dots) */
function buildImageMedia(images) {
  if (!images || !images.length) return '';
  if (images.length === 1) {
    return `<div class="media-wrap single-img">
      <img src="${images[0]}" alt="Post image" class="media-img" loading="lazy"/>
    </div>`;
  }
  const slides = images.map((src, i) =>
    `<div class="carousel-slide${i === 0 ? ' active' : ''}">
       <img src="${src}" alt="Image ${i+1}" class="media-img" loading="lazy"/>
     </div>`
  ).join('');
  const dots = images.map((_, i) =>
    `<button class="c-dot${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="Image ${i+1}"></button>`
  ).join('');
  return `<div class="media-wrap carousel" data-total="${images.length}" data-current="0">
    <div class="carousel-track">${slides}</div>
    <button class="c-prev" aria-label="Previous">&#8249;</button>
    <button class="c-next" aria-label="Next">&#8250;</button>
    <div class="c-dots">${dots}</div>
    <span class="c-counter">1 / ${images.length}</span>
  </div>`;
}

/** Builds a responsive video player */
function buildVideoMedia(src) {
  if (!src) {
    return `<div class="media-wrap video-placeholder">
      <div class="placeholder-inner">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"><polygon points="5,3 19,12 5,21"/></svg>
        <span>Video unavailable</span>
      </div>
    </div>`;
  }
  return `<div class="media-wrap video-wrap">
    <video class="media-video" controls preload="metadata" playsinline>
      <source src="${src}" type="video/mp4"/>
      Your browser does not support video.
    </video>
  </div>`;
}

/** Builds a custom audio player */
function buildAudioMedia(src, coverImg) {
  const cover = coverImg
    ? `<img src="${coverImg}" class="audio-cover" alt="Audio cover" loading="lazy"/>`
    : `<div class="audio-cover-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>`;

  if (!src) {
    return `<div class="media-wrap audio-wrap no-src">${cover}<span class="audio-unavail">Audio unavailable</span></div>`;
  }

  return `<div class="media-wrap audio-wrap">
    ${cover}
    <div class="audio-controls">
      <button class="audio-play-btn" aria-label="Play/Pause">
        <svg class="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        <svg class="icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      </button>
      <div class="audio-progress-wrap">
        <div class="audio-progress-bar">
          <div class="audio-progress-fill"></div>
        </div>
        <div class="audio-times">
          <span class="audio-current">0:00</span>
          <span class="audio-duration">--:--</span>
        </div>
      </div>
    </div>
    <audio preload="metadata" src="${src}"></audio>
  </div>`;
}

// ── POST TYPE BADGE ───────────────────────────────────────────
const TYPE_META = {
  IMAGE:   { label: 'Photo',   cls: 'badge-photo'   },
  VIDEO:   { label: 'Video',   cls: 'badge-video'   },
  AUDIO:   { label: 'Audio',   cls: 'badge-audio'   },
  STORY:   { label: 'Story',   cls: 'badge-story'   },
  RIDDLE:  { label: 'Riddle',  cls: 'badge-riddle'  },
  PROVERB: { label: 'Proverb', cls: 'badge-proverb' },
};

function buildBadge(type) {
  const m = TYPE_META[type] || { label: type, cls: 'badge-default' };
  return `<span class="type-badge ${m.cls}">${m.label}</span>`;
}

// ── CARD BUILDER ─────────────────────────────────────────────
function buildCard(post) {
  const id        = post.postId;
  const isLiked   = likedPosts.has(String(id));
  const likeCount = post.likes || 0;
  const cmtCount  = (post.comments || []).length + (localComments[id] ? localComments[id].length : 0);
  const type      = (post.type || 'IMAGE').toUpperCase();

  // Choose correct media block
  let mediaHtml = '';
  if (post.video != null || post.audio != null || post.galleryImages != null) {
    if (post.video) {
      mediaHtml = buildVideoMedia(post.video);
    }
    if (post.audio) {
      mediaHtml = buildAudioMedia(post.audio, post.image);
    }
    if (post.galleryImages) {
      mediaHtml = buildImageMedia(post.galleryImages);
    }
  } else if (type === 'AUDIO') {
    mediaHtml = buildAudioMedia(post.audio, post.image);
  } else if (post.images && post.images.length) {
    mediaHtml = buildImageMedia(post.images);
  } else if (post.image) {
    mediaHtml = buildImageMedia([post.image]);
  }

  return `
    <article class="post-card" data-id="${id}" data-type="${type}">
      ${mediaHtml}
      <div class="card-body">
        <div class="card-meta">
          ${buildBadge(type)}
        </div>
        <h3 class="card-title">${escHtml(post.title || '')}</h3>
        <p class="card-desc">${escHtml(post.content || '')}</p>
      </div>
      <div class="card-footer">
        <button class="action-btn comment-btn" data-id="${id}" aria-label="Comments">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span class="comment-count">${cmtCount || 0}</span>
        </button>
        <button class="action-btn heart-btn${isLiked ? ' liked' : ''}" data-id="${id}" aria-label="Like">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isLiked ? '#e74c3c' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span class="like-count">${likeCount || 0}</span>
        </button>
      </div>
    </article>`;
}

// ── RENDER ───────────────────────────────────────────────────
function renderPosts(posts) {
  const feed = document.getElementById('postsFeed');
  feed.innerHTML = posts.map(buildCard).join('');

  // Bind interactions after DOM is ready
  bindLikes(feed);
  bindComments(feed, posts);
  bindCarousels(feed);
  bindAudioPlayers(feed);
  bindImageLightbox(feed, posts);
  initScrollAnimation(feed);
}

// ── LIKE BINDINGS ─────────────────────────────────────────────
function bindLikes(feed) {
  feed.querySelectorAll('.heart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const postId  = btn.dataset.id;
      const countEl = btn.querySelector('.like-count');
      const svg     = btn.querySelector('svg');
      handleLike(postId, btn, countEl).then(() => {
        svg.setAttribute('fill', btn.classList.contains('liked') ? '#e74c3c' : 'none');
      });
    });
  });
}

// ── COMMENT BINDINGS ──────────────────────────────────────────
function bindComments(feed, posts) {
  feed.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const postId = btn.dataset.id;
      const post   = posts.find(p => String(p.postId) === String(postId));
      openComments(postId, post ? post.comments : []);
    });
  });
}

// ── CAROUSEL BINDINGS ─────────────────────────────────────────
function bindCarousels(feed) {
  feed.querySelectorAll('.carousel').forEach(car => {
    const track   = car.querySelector('.carousel-track');
    const slides  = car.querySelectorAll('.carousel-slide');
    const dots    = car.querySelectorAll('.c-dot');
    const counter = car.querySelector('.c-counter');
    const total   = parseInt(car.dataset.total, 10);
    let current   = 0;

    function goTo(idx) {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (idx + total) % total;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
      if (counter) counter.textContent = `${current + 1} / ${total}`;
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    car.querySelector('.c-prev')?.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
    car.querySelector('.c-next')?.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });
    dots.forEach(dot => dot.addEventListener('click', e => { e.stopPropagation(); goTo(parseInt(dot.dataset.idx, 10)); }));

    // Touch swipe
    let touchStart = 0;
    car.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend',   e => {
      const diff = touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });
  });
}

// ── AUDIO PLAYER BINDINGS ─────────────────────────────────────
function bindAudioPlayers(feed) {
  feed.querySelectorAll('.audio-wrap').forEach(wrap => {
    const audio    = wrap.querySelector('audio');
    const playBtn  = wrap.querySelector('.audio-play-btn');
    const fill     = wrap.querySelector('.audio-progress-fill');
    const bar      = wrap.querySelector('.audio-progress-bar');
    const currTime = wrap.querySelector('.audio-current');
    const durTime  = wrap.querySelector('.audio-duration');
    const iconPlay  = wrap.querySelector('.icon-play');
    const iconPause = wrap.querySelector('.icon-pause');

    if (!audio || !playBtn) return;

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        // Pause all other audios
        document.querySelectorAll('.audio-wrap audio').forEach(a => { if (a !== audio) a.pause(); });
        audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', () => {
      iconPlay.style.display  = 'none';
      iconPause.style.display = '';
    });
    audio.addEventListener('pause', () => {
      iconPlay.style.display  = '';
      iconPause.style.display = 'none';
    });
    audio.addEventListener('loadedmetadata', () => {
      durTime.textContent = fmtTime(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (fill)     fill.style.width      = pct + '%';
      if (currTime) currTime.textContent  = fmtTime(audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      iconPlay.style.display  = '';
      iconPause.style.display = 'none';
      if (fill) fill.style.width = '0%';
    });

    // Seek by clicking progress bar
    bar?.addEventListener('click', e => {
      const rect = bar.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  });
}

// ── LIGHTBOX BINDINGS ─────────────────────────────────────────
function bindImageLightbox(feed, posts) {
  feed.querySelectorAll('.post-card').forEach(card => {
    const postId = card.dataset.id;
    const post   = posts.find(p => String(p.postId) === String(postId));
    if (!post) return;

    const imgs = post.images && post.images.length ? post.images : (post.image ? [post.image] : []);
    if (!imgs.length) return;

    card.querySelectorAll('.media-img').forEach((img, idx) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', e => {
        e.stopPropagation();
        openLightbox(imgs, idx);
      });
    });
  });
}

// ── SCROLL ANIMATION ─────────────────────────────────────────
function initScrollAnimation(feed) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  feed.querySelectorAll('.post-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.06}s`;
    card.style.animationPlayState = 'paused';
    observer.observe(card);
  });
}

// ── UTILITIES ────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtTime(sec) {
  if (!isFinite(sec)) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function timeAgo(ts) {
  const timestamp = typeof ts === 'string' ? Date.parse(ts) : ts;

  const diff = Date.now() - timestamp;
  if (diff < 60000)   return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ── BOOT ─────────────────────────────────────────────────────
(async function init() {
  const posts = await fetchPosts();
  console.log("Fetched posts:", posts);
  renderPosts(posts);
})();