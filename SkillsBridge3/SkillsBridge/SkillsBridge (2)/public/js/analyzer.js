document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    const menuButton = document.getElementById("menuButton");
    const menuIcon = document.getElementById("menuIcon");
    const mobileMenu = document.getElementById("mobileMenu");
    const currentYear = document.getElementById("currentYear");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const skillsInput = document.getElementById("skillsInput");
    const aiRecommendations = document.getElementById("aiRecommendations");
    const suggestionsDiv = document.getElementById("suggestions");
    const courseRecommendations = document.getElementById("courseRecommendations");

    currentYear.textContent = new Date().getFullYear();

    analyzeBtn.addEventListener("click", async () => {
        const userInput = skillsInput.value.trim();

        if (!userInput) {
            alert("Please enter your skills or paste your resume!");
            return;
        }

        console.log("Sending request with input:", userInput);

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analyzing...";
        aiRecommendations.classList.add("hidden");
        suggestionsDiv.innerHTML = '<p class="text-gray-500">Loading suggestions...</p>';
        courseRecommendations.innerHTML = '<p class="text-gray-500">Fetching courses...</p>';

        try {
            console.log("Fetching from: /api/analyze");
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skillsInput: userInput })
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Raw error response:", errorData);
                throw new Error(`Server error: ${response.status} - ${errorData || "No details provided"}`);
            }

            const data = await response.json();
            console.log("API Response:", data);

            if (!data.suggestions || !Array.isArray(data.suggestions) || !data.courses || !Array.isArray(data.courses)) {
                throw new Error("Invalid response format from server.");
            }

            suggestionsDiv.innerHTML = data.suggestions
                .map((suggestion) => `<p>${suggestion}</p>`)
                .join("") || '<p class="text-gray-600">No suggestions available.</p>';

            if (data.courses.length > 0) {
                courseRecommendations.innerHTML = data.courses
                    .map((course) => `
                        <div class="course-card">
                            <img 
                                src="${course.image}" 
                                alt="${course.title}" 
                                class="w-full h-48 object-cover rounded-t-xl mb-4" 
                                onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Available';"
                            >
                            <h4 class="text-xl font-semibold text-gray-900 mb-2">${course.title}</h4>
                            <p class="text-gray-600 mb-4">${course.description || "No description available."}</p>
                            <a 
                                href="${course.url}" 
                                target="_blank" 
                                class="btn-primary inline-block w-full text-center"
                            >${course.title.startsWith('No courses found') ? 'Search Manually' : 'Enroll Now'}</a>
                        </div>
                    `)
                    .join("");
            } else {
                courseRecommendations.innerHTML = '<p class="text-gray-600">No courses found for your skills. Try refining your input!</p>';
            }

            aiRecommendations.classList.remove("hidden");
            aiRecommendations.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            console.error("Error during skill analysis:", error.message);
            suggestionsDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}. Please try again.</p>`;
            courseRecommendations.innerHTML = '<p class="text-red-600">Unable to fetch courses at this time.</p>';
            aiRecommendations.classList.remove("hidden");
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = "Analyze My Skills";
        }
    });

    let isMenuOpen = false;
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            navbar.classList.add("bg-white/80", "backdrop-blur-lg", "shadow-lg");
            navbar.classList.remove("bg-transparent");
            document.querySelectorAll(".nav-link").forEach((link) => {
                link.classList.remove("text-white");
                link.classList.add("text-gray-900");
                if (link.classList.contains("active")) link.classList.add("text-blue-600");
            });
        } else {
            navbar.classList.remove("bg-white/80", "backdrop-blur-lg", "shadow-lg");
            navbar.classList.add("bg-transparent");
            document.querySelectorAll(".nav-link").forEach((link) => {
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

    document.querySelectorAll("#mobileMenu a").forEach((link) => {
        link.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
            menuIcon.classList.add("fa-bars");
            menuIcon.classList.remove("fa-times");
            isMenuOpen = false;
        });
    });
});