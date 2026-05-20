/**
 * Builds the system prompt for the Groq AI model to ensure a structured JSON response.
 * 
 * @returns {string} The system prompt instructions.
 */
const buildSystemPrompt = () => {
  return `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach.
Your task is to analyze the provided Resume against the provided Job Description.

You MUST respond strictly with a valid JSON object matching the following schema.
Do NOT include any introductory or concluding text. Do NOT wrap the JSON in markdown code blocks (e.g., \`\`\`json). Just return the raw JSON string.

Schema:
{
  "compatibility_score": number, // A score from 0 to 100 indicating how well the resume matches the job description
  "missing_skills": string[], // An array of key skills mentioned in the JD that are missing from the resume
  "optimization_tips": string[], // An array of actionable tips to improve the resume for this specific role
  "bullet_point_improvements": [ // An array of suggested improvements for specific resume bullet points
    {
      "original": string, // A bullet point from the original resume
      "suggested": string, // Your improved, more impactful version of the bullet point (e.g., adding metrics/action verbs)
      "reason": string // Why this change improves the ATS score or impact
    }
  ]
}`;
};

/**
 * Strips markdown formatting (like ```json ... ```) from the LLM response if present,
 * to ensure it can be safely parsed by JSON.parse().
 * 
 * @param {string} rawResponse - The raw string returned by the LLM.
 * @returns {string} The cleaned string, hopefully valid JSON.
 */
const stripMarkdown = (rawResponse) => {
  let cleaned = rawResponse.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  return cleaned.trim();
};

/**
 * Analyzes a resume against a job description using the Groq API (LLaMA model).
 * 
 * @param {string} resumeText - The extracted text of the user's resume.
 * @param {string} jobDescription - The target job description text.
 * @returns {Promise<Object|string>} The parsed JSON analysis, or the raw text if JSON parsing fails.
 */
export const analyzeWithGroq = async (resumeText, jobDescription) => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in the environment variables.");
  }

  const userContent = `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: userContent }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content || "";
    
    // Attempt to parse the response as JSON
    const cleanedContent = stripMarkdown(rawContent);
    try {
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      console.warn("Failed to parse Groq response as JSON. Returning raw text.", parseError);
      return rawContent; // Fallback to raw text
    }

  } catch (error) {
    console.error("Error in analyzeWithGroq:", error);
    throw error;
  }
};
