/* ======================================================================
   MGH — SITE BEHAVIOR
   ----------------------------------------------------------------------
   Handles four things, each in its own clearly-labeled section:
     A. Hiding the loading screen once the page has finished loading
     B. Showing the loading screen again for a moment when the visitor
        clicks a link to another page on the site (page-to-page transition)
     C. The thin scroll-progress bar under the navbar
     D. The mobile hamburger menu + highlighting the current page in the nav
   ====================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("page-loader");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------------------------
     A. HIDE THE LOADER ONCE THE PAGE IS READY
     ------------------------------------------------------------------ */
  function hideLoader() {
    if (!loader) return;
    loader.classList.add("is-hidden");
  }
  // Small delay so the loading animation is actually visible rather than
  // flashing instantly, but skip the delay if the visitor prefers less motion.
  window.addEventListener("load", () => {
    setTimeout(hideLoader, prefersReducedMotion ? 0 : 500);
  });

  /* ------------------------------------------------------------------
     B. SHOW THE LOADER AGAIN WHEN NAVIGATING TO ANOTHER PAGE
     Intercepts clicks on internal links (e.g. events.html, products.html)
     so the loading screen plays briefly before the browser actually
     navigates. External links and links with target="_blank" are left
     alone.
     ------------------------------------------------------------------ */
  const internalLinks = document.querySelectorAll('a[href$=".html"]');
  internalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const sameTab = !link.target || link.target === "_self";
      if (!sameTab) return;

      const destination = link.getAttribute("href");
      e.preventDefault();

      if (loader) loader.classList.remove("is-hidden");

      setTimeout(() => {
        window.location.href = destination;
      }, prefersReducedMotion ? 50 : 650);
    });
  });

  /* ------------------------------------------------------------------
     C. SCROLL PROGRESS BAR
     ------------------------------------------------------------------ */
  const progressBar = document.getElementById("scroll-progress-bar");
  function updateProgressBar() {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = percent + "%";
  }
  window.addEventListener("scroll", updateProgressBar, { passive: true });
  updateProgressBar();

  /* ------------------------------------------------------------------
     D. MOBILE NAV TOGGLE + ACTIVE LINK HIGHLIGHT
     ------------------------------------------------------------------ */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinksEl = document.querySelector(".nav-links");
  if (navToggle && navLinksEl) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinksEl.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Highlight whichever nav link matches the current page filename
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) link.classList.add("is-active");
  });
});
