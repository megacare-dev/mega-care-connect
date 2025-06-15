// This is the main function that runs the LIFF application logic.
async function main() {
  try {
    // Initialize LIFF with your specific LIFF ID.
    await liff.init({ liffId: "2005687951-Y3wNramZ" });

    // Check if the user is logged in.
    if (liff.isLoggedIn()) {
      // If logged in, get the user's profile.
      const profile = await liff.getProfile();

      // Update the DOM with the user's information.
      updateUserProfile(profile);
    } else {
      // If not logged in, initiate the login process.
      liff.login();
    }
  } catch (error) {
    // Log any errors that occur during initialization.
    console.error('LIFF Initialization failed', error);
  }
}

// A helper function to update the DOM with profile information.
// This makes the logic cleaner and easier to test.
function updateUserProfile(profile) {
  if (profile) {
    const userIdElement = document.getElementById("userId");
    const displayNameElement = document.getElementById("displayName");
    const profilePictureElement = document.getElementById("profilePicture");
    const profileSectionElement = document.getElementById("profile");

    if (userIdElement) userIdElement.textContent = profile.userId;
    if (displayNameElement) displayNameElement.textContent = profile.displayName;
    if (profilePictureElement) profilePictureElement.src = profile.pictureUrl;
    if (profileSectionElement) profileSectionElement.style.display = "flex";
  }
}

// This block ensures the main function runs only when the script is loaded in a browser.
// It checks if the 'window' object exists.
if (typeof window !== 'undefined') {
  main();
}

// This block exports the functions for testing purposes.
// It checks if 'module' exists, which is true in the Node.js environment used by Jest.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { main, updateUserProfile };
}
