const STOP_WORDS = new Set([
  "a", "an", "and", "the", "with", "for", "from", "that", "this", "these", "those",
  "are", "is", "was", "were", "will", "can", "has", "have", "had", "not", "but", 
  "also", "about", "your", "our", "their", "what", "which", "who", "when", "where",
  "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", 
  "such", "than", "too", "very", "you", "they", "them", "it", "its", "been", "being", 
  "does", "do", "did", "doing", "would", "should", "could", "to", "in", "of", "on", 
  "at", "by", "as", "or", "if", "we", "us", "my", "me"
]);

/**
 * Extracts keywords from a block of text.
 * Converts to lowercase, strips non-alpha characters (keeping +, #, ., -),
 * and returns an array of relevant keywords (filtering out stop words).
 *
 * @param {string} text - The raw text to extract keywords from.
 * @returns {string[]} Array of lowercase keyword strings.
 */
export const extractKeywords = (text) => {
  if (!text || typeof text !== "string") {
    return [];
  }

  // Lowercase the entire text, then match words with a more inclusive regex
  // [a-z0-9+#.-]+ matches letters, numbers, and tech symbols like C++, C#, Node.js, .NET
  const rawMatches = text.toLowerCase().match(/[a-z0-9+#.-]+/g);
  
  if (!rawMatches) return [];

  // Filter out stop words and standalone punctuation/numbers unless they are meaningful
  const keywords = rawMatches.filter((word) => {
    if (STOP_WORDS.has(word)) return false;
    if (word.length <= 1 && !["c", "r", "go"].includes(word)) return false; // allow C, R, Go
    return true;
  });

  return keywords;
};
