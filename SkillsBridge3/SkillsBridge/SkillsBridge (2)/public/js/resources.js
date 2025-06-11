document.addEventListener("DOMContentLoaded", async () => {
    const resourceTabs = document.getElementById("resourceTabs");
    const resourceModal = document.getElementById("resourceModal");
    const navbar = document.getElementById("navbar");
    const menuButton = document.getElementById("menuButton");
    const menuIcon = document.getElementById("menuIcon");
    const mobileMenu = document.getElementById("mobileMenu");
    const currentYear = document.getElementById("currentYear");
    let resources = [];

    currentYear.textContent = new Date().getFullYear();

    const sampleResources = [
        { 
            id: "python", 
            title: "Master Python Programming", 
            shortDescription: "Learn Python with interactive fun!", 
            detailedDescription: "Dive into Python with hands-on projects, from basics to advanced topics like data analysis and machine learning.", 
            url: "https://www.python.org", 
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
            span: "md:col-span-2" 
        },
        { 
            id: "javascript", 
            title: "JavaScript for Web Dev", 
            shortDescription: "Build dynamic web apps.", 
            detailedDescription: "Master JavaScript with real-world projects, covering DOM manipulation to frameworks like React.", 
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", 
            image: "https://images.unsplash.com/photo-1593720213427-1f658a1eb3a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
        },
        { 
            id: "sql", 
            title: "SQL Database Skills", 
            shortDescription: "Manage data like a pro.", 
            detailedDescription: "Learn SQL to query and analyze databases, a must-have skill for data roles.", 
            url: "https://www.w3schools.com/sql/", 
            image: "https://images.unsplash.com/photo-1593720216276-0bb43224f9c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
        },
        { 
            id: "career", 
            title: "Career Coaching Hub", 
            shortDescription: "Personalized guidance to soar.", 
            detailedDescription: "Get one-on-one coaching, resume tips, and interview prep to boost your career.", 
            url: "#", 
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
            span: "md:col-span-2 md:row-span-2" 
        },
    ];

    try {
        const snapshot = await db.collection("resources").get();
        resources = snapshot.empty ? sampleResources : snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTabs(resources);
    } catch (error) {
        console.error("Error:", error);
        resources = sampleResources;
        renderTabs(resources);
    }

    function renderTabs(resourceArray) {
        resourceTabs.innerHTML = resourceArray.map(resource => `
            <div class="tab ${resource.span || ''}" style="background-image: url('${resource.image}');">
                <h3 class="text-2xl font-semibold mb-4">${resource.title}</h3>
                <p class="text-lg">${resource.shortDescription}</p>
            </div>
        `).join("");

        document.querySelectorAll(".tab").forEach(tab => {
            tab.addEventListener("click", () => {
                const resource = resources.find(r => r.title === tab.querySelector("h3").textContent);
                showModal(resource);
            });
        });
    }

    function showModal(resource) {
        resourceModal.innerHTML = `
            <div class="modal-content relative">
                <button class="modal-close">×</button>
                <img src="${resource.image}" alt="${resource.title}" class="w-full h-48 object-cover rounded-t-xl mb-6">
                <h3 class="text-2xl font-bold mb-4">${resource.title}</h3>
                <p class="mb-6">${resource.detailedDescription}</p>
                <div class="flex justify-between">
                    <a href="${resource.url}" target="_blank" class="btn-primary inline-block">Start Learning</a>
                    <button id="modalCloseBtn" class="btn-orange inline-block">Close</button>
                </div>
            </div>
        `;
        resourceModal.classList.remove("hidden");

        const closeButtons = [document.querySelector(".modal-close"), document.getElementById("modalCloseBtn")];
        closeButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                resourceModal.classList.add("hidden");
            });
        });

        resourceModal.addEventListener("click", (e) => {
            if (e.target === resourceModal) resourceModal.classList.add("hidden");
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