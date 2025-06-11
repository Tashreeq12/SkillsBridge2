const express = require('express');
const router = express.Router();
const { googleSearch, searchCourses } = require('../services/courseSearch');
const { skillDatabase, jobContexts } = require('../data/skills');

// Simulated AI suggestion generator
const generateAISuggestions = async (skills, role, gaps, domain) => {
    const prompt = `
        As a career advisor, provide 2-3 concise, professional paragraphs of advice for a user with skills: ${skills.join(', ')}. 
        They suit a "${role}" role in "${domain}". Skill gaps: ${gaps.length > 0 ? gaps.join(', ') : 'none'}. 
        Include actionable steps, industry trends, and specific examples (e.g., tools, certifications). Tailor to the input.
    `;
    console.log('AI Prompt:', prompt);

    return [
        skills.length > 0 ?
            `Your proficiency in ${skills.join(', ')} positions you well for a ${role} role in ${domain}. This sector is thriving, with ${domain === "technology" ? "companies like Google and Amazon driving demand for cutting-edge solutions" : "industry-specific growth trends"}. Begin by applying ${skills[0]} to practical projects or open-source contributions to showcase your expertise.` :
            `No specific skills were identified. In ${domain}, starting with skills like ${domain === "technology" ? "JavaScript" : "communication"} can open doors. Specify your skills for personalized guidance.`,

        gaps.length > 0 ?
            `To enhance your ${role} capabilities, focus on ${gaps.join(', ')}. In ${domain}, ${gaps[0]} is critical—consider ${domain === "technology" ? "online courses on platforms like Udemy or certifications like AWS Certified Developer" : "relevant training or credentials"}. This can lead to opportunities at top ${domain === "technology" ? "tech firms" : "organizations"}.` :
            `Your ${role} skills are robust, covering ${skills.slice(0, 3).join(', ')}. Stay ahead with ${domain === "technology" ? "advanced topics like React or cloud computing" : "specialized skills"} to prepare for leadership roles.`
    ];
};

router.post('/analyze', async (req, res) => {
    const { skillsInput } = req.body;

    if (!skillsInput || typeof skillsInput !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing skills input.' });
    }

    console.log('User Input:', skillsInput);

    try {
        // Parse skills (fix normalization to match skills.js)
        const manualSkills = skillsInput.split(/[,.\n;]+/).map(s => s.trim()).filter(s => s.length > 0);
        const userSkills = manualSkills.map(skill => {
            const lower = skill.toLowerCase();
            return lower === 'javascript' ? 'JavaScript' : skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
        });
        console.log('Extracted Skills:', userSkills);

        // Match against static database
        const allSkills = Object.values(skillDatabase).flat();
        const knownSkills = userSkills.filter(skill => allSkills.includes(skill));
        const unknownSkills = userSkills.filter(skill => !allSkills.includes(skill));
        console.log('Known Skills:', knownSkills, 'Unknown Skills:', unknownSkills);

        // Infer job role
        let likelyRole = 'General Professional';
        if (knownSkills.length > 0) {
            let maxOverlap = 0;
            for (const [role, skills] of Object.entries(jobContexts)) {
                const overlap = skills.filter(skill => knownSkills.includes(skill)).length;
                if (overlap > maxOverlap && overlap >= 1) {
                    likelyRole = role;
                    maxOverlap = overlap;
                }
            }
        } else if (unknownSkills.length > 0) {
            // Fallback for common skills like "Javascript"
            if (unknownSkills.some(skill => skill.toLowerCase() === 'javascript')) {
                likelyRole = 'Web Developer';
            }
        }

        // Dynamic role for unknown skills
        let finalRole = likelyRole;
        let dynamicSkills = [];
        if (unknownSkills.length > 0) {
            const searchQuery = `${userSkills.join(' ')} career opportunities`;
            const searchResults = await googleSearch(searchQuery, 3);
            if (searchResults.length > 0) {
                const topResult = searchResults[0];
                finalRole = extractRoleFromText(topResult.title + ' ' + topResult.snippet) || finalRole;
                dynamicSkills = extractSkillsFromText(topResult.snippet, allSkills);
            }
        }
        console.log('Final Role:', finalRole);

        // Skill gaps (use jobContexts if role is specific, otherwise user skills)
        const targetSkills = jobContexts[finalRole] || dynamicSkills.length > 0 ? dynamicSkills : allSkills.slice(0, 5);
        const skillGaps = targetSkills.filter(skill => !userSkills.includes(skill));

        // Domain inference
        const domain = finalRole.includes("Engineer") || finalRole.includes("Developer") ? "technology" :
                      finalRole.includes("Teacher") || finalRole.includes("Counselor") ? "education" :
                      finalRole.includes("Manager") || finalRole.includes("Analyst") ? "business" :
                      finalRole.includes("Designer") || finalRole.includes("Director") ? "creative industries" :
                      finalRole.includes("Nurse") || finalRole.includes("Therapist") ? "healthcare" :
                      finalRole.includes("Carpenter") || finalRole.includes("Electrician") ? "trades" :
                      finalRole.includes("Lawyer") || finalRole.includes("Paralegal") ? "legal" : "various sectors";

        // AI suggestions
        const suggestions = await generateAISuggestions([...knownSkills, ...unknownSkills], finalRole, skillGaps, domain);

        // Fetch courses (prioritize user skills over gaps if gaps are nonsense)
        const recommendedSkills = skillGaps.length > 0 && skillGaps.every(s => allSkills.includes(s)) ? skillGaps : userSkills.length > 0 ? userSkills : [allSkills[0]];
        const courses = [];
        for (const skill of recommendedSkills) {
            const skillCourses = await searchCourses(skill);
            if (skillCourses.length > 0) {
                courses.push(...skillCourses);
            } else {
                courses.push({
                    skill,
                    title: `No courses found for ${skill}`,
                    description: `We couldn’t locate courses for ${skill}. Try searching manually on Google.`,
                    url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' online course')}`,
                    image: 'https://via.placeholder.com/400x200?text=No+Image'
                });
            }
        }

        console.log('Final Courses:', courses);

        res.json({
            suggestions,
            courses
        });
    } catch (error) {
        console.error('Analysis Error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Improved skill extraction
function extractSkillsFromText(text, knownSkills) {
    const words = text.split(/\W+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    return words.filter(word => knownSkills.includes(word)); // Only known skills
}

function extractRoleFromText(text) {
    const roleKeywords = Object.keys(jobContexts).map(role => role.toLowerCase());
    for (const role of roleKeywords) {
        if (text.toLowerCase().includes(role)) {
            return role.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    }
    return null;
}

module.exports = router;