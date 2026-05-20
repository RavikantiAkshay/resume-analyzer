/**
 * Extracts keywords from a block of text.
 * Converts to lowercase, strips non-alpha characters,
 * and returns an array of words with 3+ characters.
 *
 * @param {string} text - The raw text to extract keywords from.
 * @returns {string[]} Array of lowercase keyword strings.
 *
 * @example
 * extractKeywords("React and Node.js") → ["react", "and", "node"]
 */
export const extractKeywords = (text) => {
  if (!text || typeof text !== "string") {
    return [];
  }

  // Lowercase the entire text, then match words with 3+ alpha characters
  const keywords = text.toLowerCase().match(/\b[a-z]{3,}\b/g);

  return keywords || [];
};
