// Festival photo URLs (Unsplash free images)
let festivalPhotos = [
  "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=600&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1578736641330-3155e606cd40?w=600&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1493225255465-4e41939d9284?w=600&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&auto=format&fit=crop&q=70",
];

// Post card data
let posts = Array.from({ length: 9 }, function(_, i) {
  return {
    id: i,
    title: "The Coastal Ngondo Festival",
    desc: "A major annual water-centered festival of the Sawa people, featuring rituals, ceremonies, and communion with water spirits.",
    count: "12.5k",
    photo: festivalPhotos[i],
    type: i % 3, // 0=plain, 1=play button, 2=playing with progress
  };
});

function buildThumb(post) {
  let overlay = "";

  if (post.type === 1) {
    overlay =
      '<div class="play-overlay">' +
        '<div class="play-circle">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="#333"><polygon points="5,3 19,12 5,21"/></svg>' +
        "</div>" +
        '<span class="duration-badge">1:50:12</span>' +
      "</div>";
  } else if (post.type === 2) {
    overlay =
      '<div class="progress-overlay">' +
        '<div class="mini-controls">' +
          '<div class="mini-ctrl">' +
            '<svg width="8" height="8" viewBox="0 0 24 24" fill="#333"><polygon points="5,3 19,12 5,21"/></svg>' +
          "</div>" +
        "</div>" +
        '<span class="time-label">0:15 / 0:47</span>' +
        '<div class="progress-bar"><div class="progress-fill" style="width:32%"></div></div>' +
      "</div>";
  }

  return (
    '<div class="thumb">' +
      '<img src="' + post.photo + '" alt="' + post.title + '" class="thumb-img" loading="lazy"/>' +
      overlay +
    "</div>"
  );
}

function renderCards() {
  let grid = document.getElementById("postsGrid");

  grid.innerHTML = posts.map(function(p) {
    return (
      '<article class="post-card" data-id="' + p.id + '">' +
        buildThumb(p) +
        '<div class="card-body">' +
          '<h3 class="card-title">' + p.title + "</h3>" +
          '<p class="card-desc">' + p.desc + "</p>" +
        "</div>" +
        '<div class="card-footer">' +
          '<span class="comment-icon">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>' +
            "</svg>" +
          "</span>" +
          '<span class="count">' + p.count + "</span>" +
          '<button class="heart-btn" aria-label="Like" data-id="' + p.id + '">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
              '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' +
            "</svg>" +
          "</button>" +
        "</div>" +
      "</article>"
    );
  }).join("");

  // Like toggle
  grid.querySelectorAll(".heart-btn").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      btn.classList.toggle("liked");
      let svg = btn.querySelector("svg");
      svg.setAttribute("fill", btn.classList.contains("liked") ? "#e74c3c" : "none");
    });
  });
}

// Staggered card entry animation on scroll
function initScrollAnimation() {
  let observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        let cards = entry.target.querySelectorAll(".post-card");
        cards.forEach(function(card, i) {
          card.style.opacity = "0";
          card.style.transform = "translateY(24px)";
          card.style.transition = "opacity 0.45s " + (i * 0.08) + "s ease, transform 0.45s " + (i * 0.08) + "s ease";
          requestAnimationFrame(function() {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          });
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(document.getElementById("postsGrid"));
}

renderCards();
initScrollAnimation();