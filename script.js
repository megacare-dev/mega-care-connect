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
    // Fetch customer data once the userId is set in the DOM and available
    if (profile.userId) {
      console.log("LINE ID for customer data fetch:", profile.userId);
      // We call this without await as updateUserProfile is synchronous
      // and we want the UI update to continue without blocking on the fetch.
      fetchAndDisplayCustomerData(profile.userId);
    }
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
    // Hide profile section if profile data is missing or DOM elements are not found.
    if (userIdElement) userIdElement.textContent = '';
    if (displayNameElement) displayNameElement.textContent = '';
    if (profilePictureElement) {
        profilePictureElement.src = '';
        profilePictureElement.alt = '';
        profilePictureElement.style.display = 'none';
    }
    profileSectionElement.style.display = "none";

    // Add more specific logging for why the profile is being hidden
    if (!profile) {
      console.log("updateUserProfile: No profile data provided. Profile section hidden.");
    } else if (!(userIdElement && displayNameElement && profilePictureElement)) {
      // This case implies profile is truthy, but some crucial child DOM elements are missing.
      let missingElements = [];
      if (!userIdElement) missingElements.push("userId");
      if (!displayNameElement) missingElements.push("displayName");
      if (!profilePictureElement) missingElements.push("profilePicture");
      console.warn(`updateUserProfile: Profile data was provided, but some DOM elements for displaying it are missing: [${missingElements.join(', ')}]. Profile section hidden.`);
    }
  }
}

/**
 * Fetches customer data from the API and displays it on the page.
 * @param {string} lineId - The LINE user ID.
 */
async function fetchAndDisplayCustomerData(lineId) {
  const apiUrl = `https://customers-service-15106852528.asia-southeast1.run.app/customers/line/${lineId}`;
  const customerDetailsCard = document.getElementById("customerDetailsCard");

  if (!customerDetailsCard) {
    console.error("Customer details card DOM element not found.");
    return;
  }

  try {
    const response = await fetch(apiUrl);
    console.log("Called customer API for LINE ID:", lineId, "Status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    const data = await response.json();

    document.getElementById("customerTitle").textContent = data.title || "N/A";
    document.getElementById("customerFirstName").textContent = data.firstName || "N/A";
    document.getElementById("customerLastName").textContent = data.lastName || "N/A";
    document.getElementById("customerDob").textContent = data.dob ? new Date(data.dob).toLocaleDateString() : "N/A";
    document.getElementById("customerLocation").textContent = data.location || "N/A";
    document.getElementById("customerStatus").textContent = data.status || "N/A";
    document.getElementById("customerSetupDate").textContent = data.setupDate ? new Date(data.setupDate).toLocaleDateString() : "N/A";
    document.getElementById("customerAirViewNumber").textContent = data.airViewNumber || "N/A";
    document.getElementById("customerMonitoringType").textContent = data.monitoringType || "N/A";
    document.getElementById("customerAvailableData").textContent = data.availableData || "N/A";
    document.getElementById("customerDealerPatientId").textContent = data.dealerPatientId || "N/A";

    customerDetailsCard.style.display = "block";

  } catch (error) {
    console.error("Error fetching customer data:", error);
    customerDetailsCard.innerHTML = `<p style="color: red;">Could not load customer details: ${error.message}</p>`;
    customerDetailsCard.style.display = "block";
  }
}

/**
 * Sets up the event listener for the device registration form.
 */
function setupDeviceFormListener() {
  const deviceForm = document.getElementById("deviceForm");
  if (deviceForm) {
    deviceForm.addEventListener("submit", async function(event) {
      event.preventDefault();
      const serialNumber = document.getElementById("serialNumber").value;
      const deviceNumber = document.getElementById("deviceNumber").value;
      
      if (!liff.isInClient()) {
        alert("This function is only available in the LINE app.");
        return;
      }

      try {
        await liff.sendMessages([
          {
            type: "text",
            text: `Device Registration Attempt:\nSN: ${serialNumber}\nDN: ${deviceNumber}`
          }
        ]);
        alert("Registration data sent to chat!");
        // Potentially close the LIFF window
        // if (liff.isInClient()) liff.closeWindow(); 
      } catch (error) {
        console.error("Error sending message or closing LIFF window:", error);
        alert("Error processing registration: " + error.message);
      }
    });
  } else {
    console.warn("Device form DOM element not found. Event listener not attached.");
  }
}

/**
 * Main function to initialize LIFF and handle user interactions.
 */
async function main() {
  try {
    if (typeof liff === 'undefined') {
      console.error("LIFF SDK not loaded. Aborting main function.");
      updateUserProfile(null); // Ensure profile is hidden
      // Hide customer details card as well if LIFF SDK is not loaded
      const customerDetailsCard = document.getElementById("customerDetailsCard");
      if (customerDetailsCard) customerDetailsCard.style.display = "none";
      return;
    }

    await liff.init({ liffId: LIFF_ID });

    if (liff.isLoggedIn()) {
      const userProfile = await liff.getProfile();
      updateUserProfile(userProfile);
      // The call to fetchAndDisplayCustomerData is now handled within updateUserProfile
    } else {
      liff.login();
      updateUserProfile(null); // Hide profile while login is initiated
    }
  } catch (error) {
    console.error("Error in main LIFF function:", error);
    alert("An error occurred during initialization: " + error.message); // User-facing error
    updateUserProfile(null); // Hide profile on error
    // Hide customer details card on error
    const customerDetailsCard = document.getElementById("customerDetailsCard");
    if (customerDetailsCard) customerDetailsCard.style.display = "none";
  }
}

// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  main();
  setupDeviceFormListener(); // Setup form listener after main logic might have run
});

// Exports for Jest testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { main, updateUserProfile, LIFF_ID, fetchAndDisplayCustomerData, setupDeviceFormListener };
}