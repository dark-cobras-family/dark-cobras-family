document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("nav#sidebar a");
  const content = document.getElementById("content");
  const searchInput = document.getElementById("search");
  let currentMarkdown = ""; // merken, was geladen ist

  // Markdown-Dateien laden
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const file = link.getAttribute("data-file");
      fetch(`/docs/${file}`)
        .then(res => res.text())
        .then(md => {
          currentMarkdown = md;
          renderMarkdown(md);
        });
    });
  });

  function renderMarkdown(md) {
    content.innerHTML = marked.parse(md);
  }

  // Suche: filtert Navigation + markiert Überschriften
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    // Navigation filtern
    const items = document.querySelectorAll("nav#sidebar li");
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? "" : "none";
    });

    // Überschriften im Content hervorheben
    if (currentMarkdown) {
      renderMarkdown(currentMarkdown); // reset Highlighting
      if (query.trim() !== "") {
        highlightHeadings(query);
      }
    }
  });

  function highlightHeadings(query) {
    const headings = content.querySelectorAll("h1,h2,h3,h4,h5,h6");
    headings.forEach(h => {
      const text = h.textContent;
      if (text.toLowerCase().includes(query)) {
        // Überschrift hervorheben
        h.style.backgroundColor = "yellow";
        h.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        h.style.backgroundColor = "";
      }
    });
  }
});
