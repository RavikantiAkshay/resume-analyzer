/**
 * Calculates an ATS compatibility score by comparing
 * job description keywords against resume keywords.
 *
 * @param {string[]} jdKeywords - Keywords extracted from the job description.
 * @param {string[]} resumeKeywords - Keywords extracted from the resume.
 * @returns {number} A percentage score (0–100) representing keyword match rate.
 *
 * @example
 * calculateATSScore(["react", "python", "javascript"], ["react", "javascript", "node"]) → 67
 */
export const calculateATSScore = (jdKeywords, resumeKeywords) => {
  if (!jdKeywords || jdKeywords.length === 0) {
    return 0;
  }

  // Deduplicate JD keywords using a Set
  const uniqueJdKeywords = new Set(jdKeywords);

  // Create a Set of resume keywords for O(1) lookup
  const resumeKeywordSet = new Set(resumeKeywords);

  // Count how many unique JD keywords appear in the resume
  let matchCount = 0;
  for (const keyword of uniqueJdKeywords) {
    if (resumeKeywordSet.has(keyword)) {
      matchCount++;
    }
  }

  // Calculate percentage and round to nearest integer
  const score = Math.round((matchCount / uniqueJdKeywords.size) * 100);

  return score;
};
