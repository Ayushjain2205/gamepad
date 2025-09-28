/**
 * Utility functions for game avatar display
 */

/**
 * Extracts the first emoji from a string, or returns null if no emoji is found
 */
export function extractFirstEmoji(text: string): string | null {
  // Unicode emoji regex that matches most emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  const match = text.match(emojiRegex);
  return match ? match[0] : null;
}

/**
 * Removes the first emoji from a string and returns the cleaned text
 */
export function removeFirstEmoji(text: string): string {
  // Unicode emoji regex that matches most emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return text.replace(emojiRegex, '').trim();
}

/**
 * Gets the appropriate avatar display for a game name
 * Returns the first emoji if found, otherwise returns the first letter
 */
export function getGameAvatar(gameName: string): {
  avatar: string;
  displayName: string;
} {
  const firstEmoji = extractFirstEmoji(gameName);
  
  if (firstEmoji) {
    return {
      avatar: firstEmoji,
      displayName: removeFirstEmoji(gameName)
    };
  }
  
  return {
    avatar: gameName.charAt(0).toUpperCase(),
    displayName: gameName
  };
}
