// LIFF ID - Centralized for consistency
const LIFF_ID = "2005687951-Y3wNramZ";

/**
 * Updates the user profile information in the DOM.
 * @param {object|null} profile - The LIFF profile object, or null to hide profile.
 */
function updateUserProfile(profile) {
  const userIdElement = document.getElementById("userId");
  const displayNameElement = document.getElementById("displayName");
  const profilePictureElement = document.getElementById("profilePicture");
  const profileSectionElement = document.getElementById("profile");

  if (!profileSectionElement) {
    console.error("Profile section DOM element not found.");
    return;
  }

  if (profile && userIdElement && displayNameElement && profilePictureElement) {
    userIdElement.textContent = profile.userId;
    displayNameElement.textContent = profile.displayName;
    if (profile.pictureUrl) {
      profilePictureElement.src = profile.pictureUrl;
      profilePictureElement.alt = `${profile.displayName}'s profile picture`;
      profilePictureElement.style.display = ''; // Show image
    } else {
      profilePictureElement.src = '';
      profilePictureElement.alt = '';
      profilePictureElement.style.display = 'none'; // Hide if no URL
    }
    profileSectionElement.style.display = "flex";
  } else {
    // Hide profile section and clear data if profile is null or elements are missing
    if (userIdElement) userIdElement.textContent = '';
    if (displayNameElement) displayNameElement.textContent = '';
    if (profilePictureElement) {
        profilePictureElement.src = '';
        profilePictureElement.alt = '';
        profilePictureElement.style.display = 'none';
    }
    profileSectionElement.style.display = "none";
    if (!profile && !(userIdElement && displayNameElement && profilePictureElement)) {
        console.warn("Profile data or some profile DOM elements were not available. Hiding profile section.");
    }
  }
}

async function main() {
  try {
    if (typeof liff === 'undefined') {
      console.error("LIFF SDK not loaded. Aborting main function.");
      updateUserProfile(null); // Ensure profile is hidden
      return;
    }

    await liff.init({ liffId: LIFF_ID });

    if (liff.isLoggedIn()) {
      const userProfile = await liff.getProfile();
      updateUserProfile(userProfile);
    } else {
      liff.login();
      updateUserProfile(null); // Hide profile while login is initiated
    }
  } catch (error) {
    console.error("Error in main LIFF function:", error);
    updateUserProfile(null); // Hide profile on error
  }
}

// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', main);

// Exports for Jest testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { main, updateUserProfile, LIFF_ID };
}