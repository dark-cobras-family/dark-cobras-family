const docsIndex = {}; // speichert: { dateiname: [{heading, level}] }
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("nav#sidebar a");
  // --- Alle Markdown-Dateien vorab scannen und Index erstellen ---
    links.forEach(link => {
      const file = link.getAttribute("data-file");
      if (file) {
        fetch(`docs/${file}`)
          .then(res => res.text())
          .then(md => {
            const html = marked.parse(md);
            const tmp = document.createElement("div");
            tmp.innerHTML = html;

            const h1 = tmp.querySelector("h1")?.textContent || file.replace(".md", "");
            const headings = [...tmp.querySelectorAll("h2, h3, h4, h5, h6")].map(h => ({
              text: h.textContent,
              parent: h1,
              level: h.tagName,
              file
            }));

            docsIndex[file] = headings;
          });
      }
    });

  const content = document.getElementById("content");
  const tocList = document.getElementById("toc-list");
  const searchInput = document.getElementById("search");
  const sidebar = document.getElementById("sidebar");
  const toc = document.getElementById("toc");
  const menuBtn = document.getElementById("menu-btn");
  const tocBtn = document.getElementById("toc-btn");
  let currentMarkdown = ""; // merken, was geladen ist

  // Standard-Seite beim ersten Laden
const defaultFile = "home.md";
fetch(`docs/${defaultFile}`)
  .then(res => res.text())
  .then(md => {
    currentMarkdown = md;
    renderMarkdown(md);
  })
  .catch(err => {
    console.warn("Konnte home.md nicht laden:", err);
  });

  // --- Mobile Sidebar Buttons ---
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    toc.classList.remove("open");
  });

  tocBtn.addEventListener("click", () => {
    toc.classList.toggle("open");
    sidebar.classList.remove("open");
  });

  // Klick außerhalb schließt Menüs
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#sidebar, #menu-btn")) {
      sidebar.classList.remove("open");
    }
    if (!e.target.closest("#toc, #toc-btn")) {
      toc.classList.remove("open");
    }
  });

  // --- Markdown-Datei laden ---
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const file = link.getAttribute("data-file");
      fetch(`docs/${file}`)
        .then(res => res.text())
        .then(md => {
          currentMarkdown = md;
          renderMarkdown(md);
          sidebar.classList.remove("open");
        });
    });
  });

  // --- Markdown rendern + Inhaltsverzeichnis erstellen ---
  function renderMarkdown(md) {
    content.innerHTML = marked.parse(md);
    buildTOC()
  }

  // Inhaltsverzeichnis (TOC) aufbauen
  function buildTOC() {
    tocList.innerHTML = "";
    const headings = content.querySelectorAll("h2, h3");
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

    // --- Neue globale Überschriften-Suche ---
    const resultsContainer = document.getElementById("toc-list");
    resultsContainer.innerHTML = "";

    if (query.trim() === "") {
      buildTOC(); // wenn leer, normales Inhaltsverzeichnis
      return;
    }

    // Alle Überschriften aus allen Docs durchsuchen
    const matches = [];
    for (const [file, headings] of Object.entries(docsIndex)) {
      for (const h of headings) {
        if (h.text.toLowerCase().includes(query)) {
          matches.push({ ...h, file });
        }
      }
    }

    // Ergebnisse anzeigen (in rechter TOC-Leiste)
    if (matches.length > 0) {
      matches.forEach(m => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.textContent = `${m.text} (${m.parent})`;
        a.href = "#";
        a.addEventListener("click", e => {
          e.preventDefault();
          searchInput.value = ""; // Suchfeld leeren
          fetch(`docs/${m.file}`)
            .then(res => res.text())
            .then(md => {
              currentMarkdown = md;
              renderMarkdown(md);
              setTimeout(() => {
                const target = [...content.querySelectorAll("h1,h2,h3")].find(h => h.textContent === m.text);
                if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 200);
            });
        });
        li.appendChild(a);
        resultsContainer.appendChild(li);
      });
    } else {
      resultsContainer.innerHTML = "<li><em>Keine Treffer gefunden</em></li>";
    }
  });
});