/* ----------------------------
   Load Header & Footer Includes
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.dataset.include)
      .then(res => res.text())
      .then(html => el.innerHTML = html)
      .catch(err => console.error("Include error:", err));
  });
});

/* ----------------------------
   Extract slug from URL
   /blog/slug-name/
----------------------------- */
function getSlugFromPath() {
  const path = window.location.pathname
    .replace(/\/$/, "")        // remove trailing slash
    .split("/");

  return path[path.length - 1];
}

const slug = getSlugFromPath();
const contentEl = document.getElementById("blog-content");

if (!slug) {
  contentEl.innerHTML = "<p>Post not found.</p>";
  throw new Error("Slug missing from URL");
}

/* ----------------------------
   Fetch data.json and render post
----------------------------- */
fetch("/data.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load data.json");
    return res.json();
  })
  .then(data => {
    const post = data.posts.find(p => p.slug === slug);

    if (!post) {
      contentEl.innerHTML = "<p>Post not found.</p>";
      document.title = "Post Not Found";
      return;
    }

    /* Page title */
    document.getElementById("blog-title").textContent = post.title;
    document.getElementById("page-title").textContent = post.title;
    document.title = post.title;

    /* Meta info */
    document.getElementById("blog-author").textContent = post.author;
    document.getElementById("blog-date").textContent =
      new Date(post.publishedDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

    /* Featured image */
    const img = document.querySelector(".featured-image img");
    const caption = document.querySelector(".featured-image figcaption");

    if (post.featuredImage) {
      img.src = post.featuredImage.src;
      img.alt = post.featuredImage.alt || "";
      caption.textContent = post.featuredImage.caption || "";
    } else {
      img.style.display = "none";
      caption.style.display = "none";
    }

    /* Blog content */
    contentEl.innerHTML = post.contentHtml;

    /* Meta description (SEO) */
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = post.title;
  })
  .catch(err => {
    console.error(err);
    contentEl.innerHTML =
      "<p>Sorry, this blog post could not be loaded.</p>";
  });