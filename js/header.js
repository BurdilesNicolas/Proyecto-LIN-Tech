const header = document.querySelector(".header");
const LIMITE_SCROLL = 300;
let hoverActivo = false;

window.addEventListener("scroll", () => {
    if (hoverActivo) return;
    if (window.scrollY > LIMITE_SCROLL) {
        header.classList.add("shrink");
    } else {
        header.classList.remove("shrink");
    }
});

header.addEventListener("mouseenter", () => {
    hoverActivo = true;
    header.classList.remove("shrink");
});

header.addEventListener("mouseleave", () => {
    hoverActivo = false;
    if (window.scrollY > LIMITE_SCROLL) {
        header.classList.add("shrink");
    }
});