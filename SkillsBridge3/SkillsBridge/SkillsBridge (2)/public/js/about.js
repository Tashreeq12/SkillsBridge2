document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    const menuButton = document.getElementById("menuButton");
    const menuIcon = document.getElementById("menuIcon");
    const mobileMenu = document.getElementById("mobileMenu");
    const currentYear = document.getElementById("currentYear");
    const teamGrid = document.getElementById("teamGrid");
    const teamModal = document.getElementById("teamModal");

    currentYear.textContent = new Date().getFullYear();

    const teamMembers = [
        {
            name: "Xhanti Mbula",
            role: "Founder & CEO",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            about: "Jane founded SkillBridge to empower career growth through technology.",
            experience: "15+ years in tech leadership and education.",
            qualifications: "MBA from Stanford, BS in Computer Science."
        },
        {
            name: "Akona Agwebi",
            role: "Lead Developer",
            image: "./images/akona.jpeg",
            about: "John drives the development of our AI-powered tools.",
            experience: "10 years in software engineering.",
            qualifications: "MS in Software Engineering from MIT."
        },
        {
            name: "Tyric Ramplin",
            role: "Career Coach",
            image: "./images/Tyric Ramplin.jpeg",
            about: "Emily helps users navigate their career transitions.",
            experience: "8 years in career counseling.",
            qualifications: "Certified Career Coach, BA in Psychology."
        },
        {
            name: "Tamia Ramplin",
            role: "Full Stack Developer",
            image: "./images/tamia.jfif",
            about: "John drives the development of our AI-powered tools.",
            experience: "10 years in software engineering.",
            qualifications: "MS in Software Engineering from MIT."
        },
        {
            name: "Tash",
            role: "Career Coach",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            about: "Emily helps users navigate their career transitions.",
            experience: "8 years in career counseling.",
            qualifications: "Certified Career Coach, BA in Psychology."
        }
    ];

    teamGrid.innerHTML = teamMembers.map(member => `
        <div class="team-card text-center">
            <img src="${member.image}" alt="${member.name}" class="rounded-full w-32 h-32 mx-auto mb-4">
            <h3 class="text-xl font-semibold text-white-100 mb-2">${member.name}</h3>
            <p class="text-gray-600 mb-4">${member.role}</p>
            <button class="btn-primary read-more" data-member='${JSON.stringify(member)}'>Read More</button>
        </div>
    `).join("");

    document.querySelectorAll(".read-more").forEach(button => {
        button.addEventListener("click", () => {
            const member = JSON.parse(button.getAttribute("data-member"));
            showTeamModal(member);
        });
    });

    function showTeamModal(member) {
        teamModal.innerHTML = `
            <div class="modal-content relative">
                <button class="modal-close">×</button>
                <img src="${member.image}" alt="${member.name}" class="w-24 h-24 rounded-full mx-auto mb-6">
                <h3 class="text-2xl font-bold mb-4">${member.name}</h3>
                <p class="mb-2"><strong>Role:</strong> ${member.role}</p>
                <p class="mb-2"><strong>About:</strong> ${member.about}</p>
                <p class="mb-2"><strong>Experience:</strong> ${member.experience}</p>
                <p class="mb-6"><strong>Qualifications:</strong> ${member.qualifications}</p>
                <button id="modalCloseBtn" class="btn-orange mx-auto block">Close</button>
            </div>
        `;
        teamModal.classList.remove("hidden");

        const closeButtons = [document.querySelector(".modal-close"), document.getElementById("modalCloseBtn")];
        closeButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                teamModal.classList.add("hidden");
            });
        });

        teamModal.addEventListener("click", (e) => {
            if (e.target === teamModal) teamModal.classList.add("hidden");
        });
    }

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