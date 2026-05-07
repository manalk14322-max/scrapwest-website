const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

const showToast = (message) => {
  let toast = document.querySelector(".site-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "site-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
};

const closeMenu = () => {
  mainNav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  if (menuToggle) menuToggle.textContent = "Menu";
};

document.querySelector("main")?.setAttribute("id", "main-content");

if (!document.querySelector(".skip-link")) {
  const skipLink = document.createElement("a");
  skipLink.className = "skip-link";
  skipLink.href = "#main-content";
  skipLink.textContent = "Skip to content";
  document.body.prepend(skipLink);
}

menuToggle?.setAttribute("aria-expanded", "false");

menuToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = mainNav.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "Close" : "Menu";
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  const linkUrl = new URL(link.getAttribute("href"), window.location.href);
  const currentUrl = new URL(window.location.href);
  const normalize = (path) => path.replace(/\/index\.html$/, "/").replace(/\/$/, "");

  if (normalize(linkUrl.pathname) === normalize(currentUrl.pathname)) {
    link.setAttribute("aria-current", "page");
  }

  link.addEventListener("click", () => {
    closeMenu();
  });
});

document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
  let closeTimer;
  const desktopMenu = window.matchMedia("(min-width: 1041px)");

  const openDropdown = () => {
    if (!desktopMenu.matches) return;
    window.clearTimeout(closeTimer);
    dropdown.classList.add("is-open-dropdown");
  };

  const closeDropdown = () => {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      dropdown.classList.remove("is-open-dropdown");
    }, 260);
  };

  dropdown.addEventListener("mouseenter", openDropdown);
  dropdown.addEventListener("mouseleave", closeDropdown);
  dropdown.addEventListener("focusin", openDropdown);
  dropdown.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!dropdown.contains(document.activeElement)) {
        dropdown.classList.remove("is-open-dropdown");
      }
    }, 0);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    document.querySelectorAll(".nav-dropdown.is-open-dropdown").forEach((dropdown) => {
      dropdown.classList.remove("is-open-dropdown");
    });
  }
});

document.addEventListener("click", (event) => {
  if (!mainNav?.classList.contains("is-open")) return;
  if (mainNav.contains(event.target) || menuToggle?.contains(event.target)) return;
  closeMenu();
});

document.querySelectorAll(".quote-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const phone = String(data.get("phone") || "").trim();
    const location = String(data.get("location") || "").trim();
    const scrapType = String(data.get("scrap-type") || "").trim();

    form.querySelectorAll(".form-error").forEach((error) => error.remove());
    form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));

    const firstInvalid = Array.from(form.querySelectorAll("input, select")).find((field) => {
      if (field.name === "phone") return !phone;
      if (field.name === "location") return !location && form.querySelector('[name="location"]');
      if (field.name === "scrap-type") return !scrapType;
      return false;
    });

    if (firstInvalid) {
      firstInvalid.setAttribute("aria-invalid", "true");
      const error = document.createElement("small");
      error.className = "form-error";
      error.textContent = "Please add this detail before sending.";
      firstInvalid.closest("label")?.appendChild(error);
      firstInvalid.focus();
      showToast("Please complete the highlighted field.");
      return;
    }

    const file = data.get("image");
    const fileNote = file && file.name ? `Uploaded image selected: ${file.name}` : "No image selected";
    const message = [
      "Hi, I want to sell scrap. Please share your best price.",
      `Name: ${data.get("name") || "-"}`,
      `Phone: ${phone || "-"}`,
      `Location: ${location || "-"}`,
      `Scrap Type: ${scrapType || "-"}`,
      fileNote
    ].join("\n");

    showToast("Opening WhatsApp with your request...");
    window.open(`https://wa.me/971501988684?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  });
});

document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener("click", () => showToast("Starting call action..."));
});

document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
  link.addEventListener("click", () => showToast("Opening WhatsApp..."));
});

if (!document.querySelector(".back-to-top")) {
  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.type = "button";
  backToTop.textContent = "Top";
  backToTop.setAttribute("aria-label", "Back to top");
  document.body.appendChild(backToTop);

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Back to top");
  });

  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 700);
  }, { passive: true });
}

const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));

if (heroSlides.length > 1) {
  let activeSlide = 0;

  window.setInterval(() => {
    heroSlides[activeSlide].classList.remove("is-active");
    activeSlide = (activeSlide + 1) % heroSlides.length;
    heroSlides[activeSlide].classList.add("is-active");
  }, 5000);
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js-ready");

const header = document.querySelector(".site-header");
const updateHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};
updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (!prefersReducedMotion) {
  const transitionLayer = document.createElement("div");
  transitionLayer.className = "page-transition-layer";
  document.body.appendChild(transitionLayer);
  requestAnimationFrame(() => document.body.classList.add("page-ready"));

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:") || href.includes("wa.me") || link.target === "_blank") return;

    link.addEventListener("click", (event) => {
      const targetUrl = new URL(href, window.location.href);
      if (targetUrl.origin !== window.location.origin) return;
      event.preventDefault();
      document.body.classList.add("page-leaving");
      window.setTimeout(() => {
        window.location.href = targetUrl.href;
      }, 420);
    });
  });

  const revealTargets = [
    ".sw-section-title",
    ".sw-service-card",
    ".sw-about-image",
    ".sw-about-copy",
    ".sw-why-grid article",
    ".sw-material-grid a",
    ".sw-icon-grid article",
    ".sw-area-grid a",
    ".sw-process-line article",
    ".sw-review-panel",
    ".sw-dark-why-card",
    ".sw-faq-grid article",
    ".sw-final-cta",
    ".sw-footer-grid > *",
    ".service-detail-card",
    ".service-shop-card",
    ".article-layout > *",
    ".quote-form",
    ".contact-card"
  ].join(",");

  const revealItems = Array.from(document.querySelectorAll(revealTargets));
  revealItems.forEach((item, index) => {
    item.classList.add("motion-reveal");
    item.style.setProperty("--motion-delay", `${Math.min(index % 8, 7) * 70}ms`);
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const valueNode = entry.target.querySelector("span");
      if (!valueNode || valueNode.dataset.counted) return;
      valueNode.dataset.counted = "true";

      const raw = valueNode.textContent.trim();
      const match = raw.match(/^(\d+)(.*)$/);
      if (!match || raw.includes("/")) {
        observer.unobserve(entry.target);
        return;
      }

      const target = Number(match[1]);
      const suffix = match[2] || "";
      const start = performance.now();
      const duration = 1200;

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        valueNode.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  document.querySelectorAll(".sw-stats article").forEach((item) => counterObserver.observe(item));

  const hero = document.querySelector(".sw-hero");
  const heroCopy = document.querySelector(".sw-hero-copy");
  if (hero && heroCopy) {
    hero.addEventListener("pointermove", (event) => {
      if (window.innerWidth < 900) return;
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--hero-x", `${x * 18}px`);
      hero.style.setProperty("--hero-y", `${y * 18}px`);
      heroCopy.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0)`;
    });

    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--hero-x", "0px");
      hero.style.setProperty("--hero-y", "0px");
      heroCopy.style.transform = "";
    });
  }

  document.querySelectorAll(".btn, .floating-whatsapp").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (window.innerWidth < 900) return;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });

  if (window.matchMedia("(pointer: fine)").matches) {
    const cursorGlow = document.createElement("div");
    cursorGlow.className = "cursor-glow";
    document.body.appendChild(cursorGlow);
    window.addEventListener("pointermove", (event) => {
      cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }, { passive: true });
  }
}

if (!document.querySelector(".hero-particles") && document.querySelector(".sw-hero")) {
  const particles = document.createElement("div");
  particles.className = "hero-particles";
  particles.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 24; index += 1) {
    const particle = document.createElement("span");
    particle.style.setProperty("--x", `${Math.random() * 100}%`);
    particle.style.setProperty("--y", `${Math.random() * 100}%`);
    particle.style.setProperty("--d", `${4 + Math.random() * 9}s`);
    particle.style.setProperty("--s", `${2 + Math.random() * 4}px`);
    particles.appendChild(particle);
  }
  document.querySelector(".sw-hero")?.appendChild(particles);
}
