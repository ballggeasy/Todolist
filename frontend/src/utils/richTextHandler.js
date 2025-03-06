// src/utils/richTextHandler.js

/**
 * Converts a Strapi 5 rich text structure to plain text
 * @param {Object|Array} richText - The rich text object from Strapi 5
 * @returns {string} - Plain text representation
 */
export const richTextToPlainText = (richText) => {
  // If it's null or undefined, return empty string
  if (richText == null) return '';
  
  // If it's already a string, return it directly
  if (typeof richText === 'string') return richText;
  
  // If it's an array (as in Strapi 5 blocks)
  if (Array.isArray(richText)) {
    return richText.map(block => {
      // Handle paragraph blocks
      if (block.type === 'paragraph') {
        return processTextNodes(block.children);
      }
      
      // Handle heading blocks
      if (block.type?.startsWith('heading')) {
        return processTextNodes(block.children);
      }
      
      // Handle other block types
      return '';
    }).join('\n\n');
  }
  
  // If we have a single block object
  if (richText.type === 'paragraph' && Array.isArray(richText.children)) {
    return processTextNodes(richText.children);
  }
  
  // If nothing matches, return a default empty string
  console.warn('Unhandled rich text format:', richText);
  return '';
};

/**
 * Process text nodes from Strapi 5 rich text structure
 * @param {Array} nodes - The children nodes from a rich text block
 * @returns {string} - Processed text content
 */
const processTextNodes = (nodes) => {
  if (!Array.isArray(nodes)) return '';
  
  return nodes.map(node => {
    if (node.type === 'text') {
      return node.text;
    }
    
    // Handle nested structures if needed
    if (Array.isArray(node.children)) {
      return processTextNodes(node.children);
    }
    
    return '';
  }).join('');
};

/**
 * Converts plain text to Strapi 5 rich text format for saving
 * @param {string} text - Plain text to convert
 * @returns {Array} - Rich text blocks structure for Strapi 5
 */
export const plainTextToRichText = (text) => {
  // If it's empty, return a minimal valid structure
  if (!text) {
    return [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: '' }],
      },
    ];
  }
  
  // Split text by double newlines to create paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  // Convert each paragraph to a rich text block
  return paragraphs.map(paragraph => ({
    type: 'paragraph',
    children: [{ type: 'text', text: paragraph.trim() }],
  }));
};