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

export const generateStarBullets = async (rawExperience) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  const systemPrompt = `You are an expert resume writer. 
Your task is to take the user's raw experience description and convert it into 3 to 5 high-impact, professional STAR-method (Situation, Task, Action, Result) bullet points.
Start with a strong action verb, include specific metrics if possible, and highlight the impact.

You MUST respond strictly with a valid JSON array of strings, like this:
[
  "Engineered a scalable data pipeline...",
  "Optimized database queries, reducing load times by 40%...",
  "Led a team of 5 developers..."
]`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Raw Experience:\n${rawExperience}` }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });
    
    if (!response.ok) throw new Error("Groq API error");
    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content || "";
    return JSON.parse(stripMarkdown(rawContent));
  } catch (error) {
    console.error("generateStarBullets error:", error);
    throw error;
  }
};

export const parseResumeToStructuredData = async (resumeText) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  const systemPrompt = `You are an expert data extraction AI.
Your task is to extract all relevant information from the provided resume text and map it STRICTLY to the JSON schema below.
If a field is missing, leave it as an empty string or empty array.

You MUST respond strictly with a valid JSON object matching the EXACT schema below. Do NOT wrap the JSON in markdown code blocks.

Schema:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string",
    "summary": "string"
  },
  "experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "grade": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "link": "string",
      "description": "string",
      "technologies": ["string"],
      "bullets": ["string"]
    }
  ],
  "skills": ["string"],
  "certifications": [
    {
      "title": "string",
      "issuer": "string",
      "date": "string"
    }
  ]
}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Resume Text:\n${resumeText}` }
        ],
        temperature: 0.1, // very low temp for strict JSON extraction
        max_tokens: 4096
      })
    });
    
    if (!response.ok) throw new Error("Groq API error");
    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content || "";
    return JSON.parse(stripMarkdown(rawContent));
  } catch (error) {
    console.error("parseResumeToStructuredData error:", error);
    throw error;
  }
};
