
import { login, register } from "./config.js";


document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    const menuButton = document.getElementById("menuButton");
    const menuIcon = document.getElementById("menuIcon");
    const mobileMenu = document.getElementById("mobileMenu");
    const currentYear = document.getElementById("currentYear");
    const reviewCarousel = document.getElementById("reviewCarousel");
    const prevReview = document.getElementById("prevReview");
    const nextReview = document.getElementById("nextReview");

    currentYear.textContent = new Date().getFullYear();

    const reviews = [
        { text: "SkillBridge helped me land a job in 3 months!", name: "Alex R.", role: "Software Engineer", image: "images/mic.jpg" },
        { text: "Upskilled in SQL and got hired fast!", name: "Maria S.", role: "Data Analyst", image: "images/R.jpg" },
        { text: "Learned a lot about tech, became a full stack developer!", name: "James T.", role: "Full Stack Developer", image: "images/ying.jpg" },
        { text: "Switched careers with confidence!", name: "Travis T.", role: "Web Developer", image: "images/ray.jpg" },
        { text: "Had fun throughout the whole journey", name: "Macine T.", role: "Web Developer", image: "images/ian.jpg" }
    ];

    let currentIndex = 0;
    let autoSlideInterval;

    function renderReviews() {
        // Duplicate the first few reviews at the end for seamless looping
        const extendedReviews = [...reviews, ...reviews.slice(0, Math.min(3, reviews.length))];
        reviewCarousel.innerHTML = extendedReviews.map(review => `
            <div class="review-card flex items-center">
                <img src="${review.image}" alt="${review.name}" class="w-16 h-16 rounded-full mr-4">
                <div>
                    <p class="text-gray-600 mb-4">"${review.text}"</p>
                    <p class="font-semibold text-gray-900">${review.name}</p>
                    <p class="text-gray-500">${review.role}</p>
                </div>
            </div>
        `).join("");
        updateCarousel(false); // Initial render without animation
    }

    function updateCarousel(animate = true) {
        const visibleCards = window.innerWidth >= 768 ? 3 : 1;
        const cardWidth = reviewCarousel.parentElement.offsetWidth / visibleCards; // Use container width
        const totalCards = reviews.length;

        if (animate) {
            reviewCarousel.style.transition = "transform 0.5s ease-in-out";
        } else {
            reviewCarousel.style.transition = "none";
        }

        reviewCarousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

        // Seamless loop: reset to start when reaching the duplicated cards
        if (currentIndex >= totalCards) {
            setTimeout(() => {
                reviewCarousel.style.transition = "none";
                currentIndex = 0;
                reviewCarousel.style.transform = `translateX(0px)`;
            }, 500); // Match transition duration
        }
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            currentIndex++;
            updateCarousel();
        }, 5000); // Slide every 5 seconds
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    nextReview.addEventListener("click", () => {
        stopAutoSlide();
        currentIndex++;
        updateCarousel();
        startAutoSlide(); // Restart auto-slide after manual click
    });

    prevReview.addEventListener("click", () => {
        stopAutoSlide();
        currentIndex = Math.max(currentIndex - 1, 0); // Prevent going below 0
        updateCarousel();
        startAutoSlide(); // Restart auto-slide after manual click
    });

    // Handle window resize for responsiveness
    window.addEventListener("resize", () => updateCarousel(false));

    // Initial render and start auto-slide
    renderReviews();
    startAutoSlide();

    // Pause auto-slide on hover
    reviewCarousel.addEventListener("mouseenter", stopAutoSlide);
    reviewCarousel.addEventListener("mouseleave", startAutoSlide);

    let isMenuOpen = false;
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            navbar.classList.add("bg-white/80", "backdrop-blur-lg", "shadow-lg");
            navbar.classList.remove("bg-transparent");
            document.querySelectorAll(".nav-link").forEach(link => {
                link.classList.remove("text-white");
                link.classList.add("text-gray-900");
                if (link.classList.contains("active")) link.classList.add("text-blue-600");
            });
        } else {
            navbar.classList.remove("bg-white/80", "backdrop-blur-lg", "shadow-lg");
            navbar.classList.add("bg-transparent");
            document.querySelectorAll(".nav-link").forEach(link => {
                link.classList.add("text-white");
                link.classList.remove("text-gray-900");
                if (link.classList.contains("active")) link.classList.add("text-blue-200");
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

    document.getElementById("login-btn").addEventListener("click", () => {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        login(email, password);
    });
    
    document.getElementById("register-btn").addEventListener("click", () => {
        let email = document.getElementById("reg-email").value;
        let password = document.getElementById("reg-password").value;
        register(email, password);
    });
});



