document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const navbar = document.getElementById("navbar");
    const menuButton = document.getElementById("menuButton");
    const menuIcon = document.getElementById("menuIcon");
    const mobileMenu = document.getElementById("mobileMenu");
    const currentYear = document.getElementById("currentYear");
    const map = document.getElementById("interactiveMap");
    const tooltip = document.getElementById("mapTooltip");

    currentYear.textContent = new Date().getFullYear();

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        // Simulate form submission
        alert(`Thank you, ${name}! Your message has been sent.\nEmail: ${email}\nMessage: ${message}`);
        form.reset();
    });

    map.querySelectorAll("circle").forEach(circle => {
        circle.addEventListener("mouseover", () => {
            const location = circle.getAttribute("data-tooltip");
            tooltip.textContent = location;
            tooltip.setAttribute("opacity", "1");
        });
        circle.addEventListener("mouseout", () => {
            tooltip.setAttribute("opacity", "0");
        });
    });

    let isMenuOpen = false;
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            navbar.classList.add("bg-white/80", "backdrop-blur-lg", "shadow-lg");
            navbar.classList.remove("bg-transparent");
            document.querySelectorAll(".nav-link").forEach(link => {
                link.classList.remove("text-white");
                link.classList.add("text-gray-900");
            });
        } else {
            navbar.classList.remove("bg-white/80", "backdrop-blur-lg", "shadow-lg");
            navbar.classList.add("bg-transparent");
            document.querySelectorAll(".nav-link").forEach(link => {
                link.classList.add("text-white");
                link.classList.remove("text-gray-900");
            });
        }
    });

    menuButton.addEventListener("click", () => {
        isMenuOpen = !isMenuOpen;
        mobileMenu.classList.toggle("hidden");
        menuIcon.classList.toggle("fa-bars");
        menuIcon.classList.toggle("fa-times");
    });

    document.querySelectorAll("#mobileMenu a").forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
            menuIcon.classList.add("fa-bars");
            menuIcon.classList.remove("fa-times");
            isMenuOpen = false;
        });
    });
});