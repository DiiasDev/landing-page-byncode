const revealElements = document.querySelectorAll(".reveal");

revealElements.forEach((element) => {
  const delay = element.dataset.delay ? `${element.dataset.delay}ms` : "0ms";
  element.style.setProperty("--reveal-delay", delay);
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const hero = document.querySelector(".hero");
const heroContent = document.querySelector(".hero-content");

if (hero && heroContent) {
  let ticking = false;

  const animateHeroOnScroll = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const maxScroll = hero.offsetHeight * 0.85;
    const progress = Math.min(scrollTop / maxScroll, 1);

    heroContent.style.transform = `translateY(${progress * 24}px)`;
    heroContent.style.opacity = `${1 - progress * 0.45}`;

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(animateHeroOnScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
}

const contactWidget = document.getElementById("contactWidget");
const contactToggle = document.getElementById("contactToggle");
const contactPanel = document.getElementById("contactPanel");
const contactClose = document.getElementById("contactClose");
const whatsappForm = document.getElementById("whatsappForm");
const openFormLinks = document.querySelectorAll("[data-open-contact-form]");
const serviceSelect = document.getElementById("servico");
const customAlert = document.getElementById("customAlert");
const customAlertText = document.getElementById("customAlertText");

let alertTimer = null;

const showCustomAlert = (message, type = "success") => {
  if (!customAlert || !customAlertText) {
    return;
  }

  customAlertText.textContent = message;
  customAlert.classList.toggle("is-error", type === "error");
  customAlert.hidden = false;
  requestAnimationFrame(() => customAlert.classList.add("is-visible"));

  if (alertTimer) {
    window.clearTimeout(alertTimer);
  }

  alertTimer = window.setTimeout(() => {
    customAlert.classList.remove("is-visible");
    window.setTimeout(() => {
      if (!customAlert.classList.contains("is-visible")) {
        customAlert.hidden = true;
      }
    }, 250);
  }, 3500);
};

let serviceChoices = null;

if (serviceSelect && typeof window.Choices === "function") {
  serviceChoices = new window.Choices(serviceSelect, {
    searchEnabled: false,
    itemSelectText: "",
    shouldSort: false,
    allowHTML: false,
    position: "bottom",
    placeholder: true,
    placeholderValue: "Selecione um serviço",
  });
}

if (contactWidget && contactToggle && contactPanel && whatsappForm) {
  const phoneNumber = "5519993292661";

  const openPanel = () => {
    contactPanel.hidden = false;
    requestAnimationFrame(() => contactPanel.classList.add("is-open"));
    contactToggle.setAttribute("aria-expanded", "true");

    const firstField = contactPanel.querySelector("input, select, textarea");
    if (firstField) {
      firstField.focus({ preventScroll: true });
    }
  };

  const closePanel = () => {
    contactPanel.classList.remove("is-open");
    contactToggle.setAttribute("aria-expanded", "false");

    window.setTimeout(() => {
      if (!contactPanel.classList.contains("is-open")) {
        contactPanel.hidden = true;
      }
    }, 240);
  };

  contactToggle.addEventListener("click", () => {
    if (contactPanel.hidden || !contactPanel.classList.contains("is-open")) {
      openPanel();
    } else {
      closePanel();
    }
  });

  if (contactClose) {
    contactClose.addEventListener("click", closePanel);
  }

  document.addEventListener("click", (event) => {
    if (contactPanel.hidden) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (target instanceof Element && target.closest("[data-open-contact-form]")) {
      return;
    }

    if (!contactWidget.contains(target)) {
      closePanel();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !contactPanel.hidden) {
      closePanel();
    }
  });

  openFormLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openPanel();
    });
  });

  whatsappForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(whatsappForm);
    const nome = String(formData.get("nome") || "").trim();
    const empresa = String(formData.get("empresa") || "").trim();
    const servico = String(formData.get("servico") || "").trim();
    const mensagem = String(formData.get("mensagem") || "").trim().replace(/\r\n/g, "\n");

    if (!nome || !servico || !mensagem) {
      return;
    }

    const dataHora = new Date().toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    });

    const lines = [
      "*Novo contato pelo site - Byncode*",
      "",
      "*Dados do cliente*",
      `• *Nome:* ${nome}`,
      `• *Empresa:* ${empresa || "Não informado"}`,
      `• *Serviço:* ${servico}`,
      "",
      "*Mensagem*",
      mensagem,
      "",
      `_Enviado em ${dataHora}_`,
    ].filter(Boolean);

    const encodedText = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    const popup = window.open(url, "_blank", "noopener,noreferrer");

    whatsappForm.reset();
    if (serviceChoices) {
      serviceChoices.removeActiveItems();
      serviceChoices.setChoiceByValue("");
    }
    closePanel();

    if (popup) {
      showCustomAlert("Mensagem pronta! Você foi direcionado para o WhatsApp.");
    } else {
      showCustomAlert("Não foi possível abrir o WhatsApp. Verifique o bloqueio de pop-up.", "error");
    }
  });
}
