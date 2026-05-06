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
    window.open(`https://wa.me/971523181007?text=${encodeURIComponent(message)}`, "_blank", "noopener");
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
