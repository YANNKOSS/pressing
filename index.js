// ====================================================
// ÉCLAT PRESSING — Script principal
// ====================================================

// ---- CONFIGURATION ----
// Remplacez par le vrai numéro WhatsApp du pressing.
// Format : indicatif pays + numéro, sans +, espaces ou tirets.
// Exemple pour Côte d'Ivoire : 2250700000000
const NUMERO_WHATSAPP = "2250506312189";

// ---- CATALOGUE DES VÊTEMENTS ----
const vetements = [
  { nom: "Chemise", emoji: "👔", prix: 1000, quantite: 0 },
  { nom: "Pantalon", emoji: "👖", prix: 1500, quantite: 0 },
  { nom: "T-shirt", emoji: "👕", prix: 700, quantite: 0 },
  { nom: "Robe", emoji: "👗", prix: 2000, quantite: 0 },
  { nom: "Costume", emoji: "🤵", prix: 3500, quantite: 0 },
  { nom: "Veste", emoji: "🧥", prix: 2500, quantite: 0 },
  { nom: "Boubou", emoji: "🫱", prix: 2500, quantite: 0 },
  { nom: "Drap", emoji: "🛏️", prix: 1500, quantite: 0 },
];

// ---- SÉLECTEURS DOM ----
const catalogueEl = document.getElementById("articles");
const totalEl = document.getElementById("total");
const formulaire = document.getElementById("orderForm");
const messageEl = document.getElementById("message");
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");
const header = document.getElementById("header");

// ---- CALCUL DU TOTAL ----
function calculerTotal() {
  return vetements.reduce((somme, v) => somme + v.prix * v.quantite, 0);
}

// ---- MISE À JOUR ANIMÉE DU TOTAL ----
function mettreAJourTotal() {
  totalEl.textContent = calculerTotal().toLocaleString("fr-FR") + " FCFA";
  totalEl.classList.add("pulse");
  setTimeout(() => totalEl.classList.remove("pulse"), 250);
}

// ---- AFFICHAGE DU CATALOGUE D'ARTICLES ----
function afficherArticles() {
  catalogueEl.innerHTML = "";

  vetements.forEach((vetement) => {
    const ligne = document.createElement("div");
    ligne.className = "article";

    // Informations
    const info = document.createElement("div");
    info.className = "article-info";

    const nom = document.createElement("strong");
    nom.textContent = vetement.emoji + " " + vetement.nom;

    const prix = document.createElement("small");
    prix.textContent = vetement.prix.toLocaleString("fr-FR") + " FCFA / pièce";

    info.append(nom, prix);

    // Contrôles quantité
    const controles = document.createElement("div");
    controles.className = "quantity";

    const boutonMoins = document.createElement("button");
    boutonMoins.type = "button";
    boutonMoins.textContent = "−";
    boutonMoins.setAttribute("aria-label", "Retirer " + vetement.nom);

    const quantiteEl = document.createElement("span");
    quantiteEl.textContent = vetement.quantite;

    const boutonPlus = document.createElement("button");
    boutonPlus.type = "button";
    boutonPlus.textContent = "+";
    boutonPlus.setAttribute("aria-label", "Ajouter " + vetement.nom);

    boutonMoins.addEventListener("click", () => {
      if (vetement.quantite > 0) {
        vetement.quantite--;
        quantiteEl.textContent = vetement.quantite;
        mettreAJourTotal();
      }
    });

    boutonPlus.addEventListener("click", () => {
      vetement.quantite++;
      quantiteEl.textContent = vetement.quantite;
      mettreAJourTotal();
    });

    controles.append(boutonMoins, quantiteEl, boutonPlus);
    ligne.append(info, controles);
    catalogueEl.appendChild(ligne);
  });

  mettreAJourTotal();
}

// ---- AFFICHAGE DES MESSAGES D'ERREUR / SUCCÈS ----
function afficherMessage(texte, type = "error") {
  messageEl.textContent = texte;
  messageEl.className = "form-message " + type;
  if (type === "error") {
    messageEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function effacerMessage() {
  messageEl.textContent = "";
  messageEl.className = "form-message";
}

// ---- SOUMISSION DU FORMULAIRE ----
formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  effacerMessage();

  // Vérifier qu'au moins un vêtement est sélectionné
  const selection = vetements.filter((v) => v.quantite > 0);
  if (selection.length === 0) {
    afficherMessage("⚠️ Veuillez choisir au moins un vêtement avant de continuer.");
    return;
  }

  // Vérifier le numéro WhatsApp
  if (!NUMERO_WHATSAPP || NUMERO_WHATSAPP === "REMPLACER_PAR_NUMERO" || !/^\d{8,15}$/.test(NUMERO_WHATSAPP)) {
    afficherMessage("⚙️ Le numéro WhatsApp du pressing n'est pas encore configuré. Contactez l'administrateur.", "error");
    return;
  }

  // Vérifier que le mode de retrait est sélectionné
  const retrait = formulaire.querySelector('input[name="retrait"]:checked');
  if (!retrait) {
    afficherMessage("⚠️ Veuillez choisir un mode de récupération.");
    return;
  }

  const donnees = new FormData(formulaire);

  // Construire la liste des articles
  const listeVetements = selection.map((v) => {
    const sous = v.prix * v.quantite;
    return `• ${v.nom} × ${v.quantite} = ${sous.toLocaleString("fr-FR")} FCFA`;
  }).join("\n");

  const total = calculerTotal();

  // Formater la date et l'heure
  const dateVal = donnees.get("date");
  const heureVal = donnees.get("heure");
  const dateFormatee = dateVal
    ? new Date(dateVal + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Non précisée";
  const heureFormatee = heureVal || "Non précisée";

  // Message WhatsApp
  const lignes = [
    "Bonjour Éclat Pressing ! 👋",
    "",
    "Je souhaite passer une commande :",
    "",
    "🧺 *ARTICLES COMMANDÉS :*",
    listeVetements,
    "",
    `💳 *Total estimatif : ${total.toLocaleString("fr-FR")} FCFA*`,
    "",
    "📋 *MES COORDONNÉES :*",
    `Nom : ${donnees.get("nom")}`,
    `Téléphone : ${donnees.get("telephone")}`,
    `Adresse : ${donnees.get("adresse")}`,
    "",
    "📅 *DATE ET HEURE SOUHAITÉES :*",
    `Date : ${dateFormatee}`,
    `Heure : ${heureFormatee}`,
    "",
    `🚗 *Mode de récupération :* ${donnees.get("retrait")}`,
    "",
    `📝 *Précisions :* ${donnees.get("notes") || "Aucune"}`,
    "",
    "Merci de confirmer la disponibilité et les tarifs définitifs. 🙏",
  ];

  const message = lignes.join("\n");
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
  afficherMessage("✅ Redirection vers WhatsApp... Vérifiez votre navigateur.", "success");
});

// ---- MENU HAMBURGER (MOBILE) ----
if (hamburger && nav) {
  hamburger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen.toString());
  });

  // Fermer le menu au clic sur un lien
  nav.querySelectorAll("a").forEach((lien) => {
    lien.addEventListener("click", () => {
      nav.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

// ---- HEADER STICKY (SCROLL EFFECT) ----
if (header) {
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ---- ANIMATION D'APPARITION DES ÉLÉMENTS ----
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));

// ---- DATE MINIMUM = AUJOURD'HUI ----
const champDate = document.getElementById("date");
if (champDate) {
  const aujourd_hui = new Date().toISOString().split("T")[0];
  champDate.min = aujourd_hui;
}

// ---- INITIALISATION ----
afficherArticles();