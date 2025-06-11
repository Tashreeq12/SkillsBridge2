// Event listener for the analyze button
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    // Get user input from the skills textarea
    const skillsInput = document.getElementById('skillsInput').value.trim();
    const suggestionsDiv = document.getElementById('suggestions');
    const coursesDiv = document.getElementById('courses');

    // Initial loading state
    suggestionsDiv.innerHTML = '<p>Analyzing your skills...</p>';
    //coursesDiv.innerHTML = '';

    // Validate input
    if (!skillsInput) {
        suggestionsDiv.innerHTML = '<p>Please enter at least one skill to analyze.</p>';
        return;
    }

    try {
        // Send POST request to the backend API
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skillsInput })
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        console.log('API Response:', data);

        // Render suggestions
        if (data.suggestions && data.suggestions.length > 0) {
            suggestionsDiv.innerHTML = data.suggestions.map(suggestion => `
                <p>${suggestion}</p>
            `).join('');
        } else {
            suggestionsDiv.innerHTML = '<p>No suggestions available at this time.</p>';
        }

        // Render course cards
        if (data.courses && data.courses.length > 0) {
            coursesDiv.innerHTML = data.courses.map(course => `
                <div class="course-card">
                    <img src="${course.image}" alt="${course.title}" 
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/400x200?text=Image+Not+Found';"
                         style="width: 400px; height: 200px; object-fit: cover;">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <a href="${course.url}" target="_blank" rel="noopener noreferrer">Learn More</a>
                </div>
            `).join('');
        } else {
            coursesDiv.innerHTML = '<p>No courses found for your skills.</p>';
        }
    } catch (error) {
        console.error('Error during analysis:', error);
        suggestionsDiv.innerHTML = '<p>Error analyzing skills. Please try again later.</p>';
        coursesDiv.innerHTML = '';
    }
});