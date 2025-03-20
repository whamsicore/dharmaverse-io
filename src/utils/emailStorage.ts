/**
 * Email storage utility
 * This implements a simple way to store and retrieve community member emails.
 * In a production app, this would be replaced with actual server storage.
 */

// Storage key used in localStorage
const EMAIL_STORAGE_KEY = 'dharmaverse_community_emails';

/**
 * Add a new email to the community list
 * @param email Email to add
 * @returns true if email was added or already exists, false if operation failed
 */
export const addEmail = (email: string): boolean => {
  try {
    if (!email || !validateEmail(email)) {
      console.error('Invalid email format:', email);
      return false;
    }
    
    const emails = getEmails();
    
    // Check if email already exists
    if (emails.includes(email)) {
      return true; // Already in the list, consider it a success
    }
    
    // Add the new email
    emails.push(email);
    
    // Save back to storage
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emails));
    console.log(`Email added: ${email}`);
    
    // Optional: In a real app, you would make an API call to save this on the server
    
    return true;
  } catch (error) {
    console.error('Failed to add email:', error);
    return false;
  }
};

/**
 * Get all community emails
 * @returns Array of emails
 */
export const getEmails = (): string[] => {
  try {
    const storedEmails = localStorage.getItem(EMAIL_STORAGE_KEY);
    return storedEmails ? JSON.parse(storedEmails) : [];
  } catch (error) {
    console.error('Failed to retrieve emails:', error);
    return [];
  }
};

/**
 * Get count of community members
 * @returns Number of members
 */
export const getCommunityCount = (): number => {
  return getEmails().length;
};

/**
 * Export the email list as text or JSON
 * @param format 'text' for newline-separated, 'json' for JSON
 * @returns String in the requested format
 */
export const exportEmails = (format: 'text' | 'json' = 'text'): string => {
  const emails = getEmails();
  
  if (format === 'json') {
    return JSON.stringify(emails, null, 2);
  }
  
  return emails.join('\n');
};

/**
 * Simple email validation
 * @param email Email to validate
 * @returns true if email format seems valid
 */
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}; 