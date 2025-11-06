document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("nav#sidebar a");
  const content = document.getElementById("content");
  const tocList = document.getElementById("toc-list");
  const searchInput = document.getElementById("search");
  let currentMarkdown = ""; // merken, was geladen ist

  // Markdown-Dateien laden
    links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const file = link.getAttribute("data-file");
      if (!file) {
        console.error("Link hat kein data-file Attribut:", link);
        return;
      }

      // relative URL statt absoluter Root-URL
      const url = new URL(`docs/${file}`, window.location.href).href;

      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`Fehler beim Laden ${url} (Status ${res.status})`);
          return res.text();
        })
        .then(md => {
          currentMarkdown = md;
          renderMarkdown(md);
        })
        .catch(err => {
          console.error(err);
          content.innerHTML = "<p>Fehler beim Laden der Markdown-Datei. Siehe Konsole.</p>";
        });
    });
  });

  function renderMarkdown(md) {
    content.innerHTML = marked.parse(md);
    buildTOC()
  }

  // Inhaltsverzeichnis (TOC) aufbauen
  function buildTOC() {
    tocList.innerHTML = "";
    const headings = content.querySelectorAll("h1, h2, h3");
    headings.forEach((h, index) => {
      const id = `heading-${index}`;
      h.id = id;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = h.textContent;
      a.href = `#${id}`;
      a.style.marginLeft = h.tagName === "H2" ? "0.5em" :
                           h.tagName === "H3" ? "1em" : "0";
      li.appendChild(a);
      tocList.appendChild(li);
    });
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
