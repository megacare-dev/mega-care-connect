/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the HTML file into the DOM environment for testing
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
document.body.innerHTML = html;

// Mock the global liff object *before* any imports that might use it
const mockLiff = {
  init: jest.fn().mockResolvedValue(),
  isLoggedIn: jest.fn(),
  getProfile: jest.fn().mockResolvedValue({ /* default mock profile */ }),
  login: jest.fn(),
};
global.liff = mockLiff;

// Import actual functions from script.js
// We'll use jest.spyOn for main's interaction with updateUserProfile
const scriptFunctions = jest.requireActual('./script.js');
const { LIFF_ID: ACTUAL_LIFF_ID, main: actualMain, updateUserProfile: actualUpdateUserProfile } = scriptFunctions;

describe('LIFF Device Registration App', () => {
  // Reset mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = html; // Reset the DOM state for each test
    mockLiff.init.mockClear().mockResolvedValue();
    mockLiff.isLoggedIn.mockClear();
    mockLiff.getProfile.mockClear().mockResolvedValue({
        userId: 'defaultUser', displayName: 'Default User', pictureUrl: 'http://example.com/default.jpg',
    });
    mockLiff.login.mockClear();
  });

  describe('main function', () => {
    test('should initialize LIFF, get profile, and call updateUserProfile when user is logged in', async () => {
      // Arrange: Set up mock return values for a logged-in user
      mockLiff.isLoggedIn.mockReturnValue(true);
      const mockProfile = {
        userId: 'U123456789',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/profile.jpg',
      };
      mockLiff.getProfile.mockResolvedValue(mockProfile);

      // Act: Run the main function
      await actualMain();

      // Assert: Verify that the correct functions were called and the DOM was updated
      expect(mockLiff.init).toHaveBeenCalledWith({ liffId: ACTUAL_LIFF_ID });
      expect(mockLiff.isLoggedIn).toHaveBeenCalled();
      expect(mockLiff.getProfile).toHaveBeenCalled();
      expect(mockLiff.login).not.toHaveBeenCalled();

      // Assert DOM changes directly (since updateUserProfile is no longer mocked here)
      expect(document.getElementById('userId').textContent).toBe(mockProfile.userId);
      expect(document.getElementById('displayName').textContent).toBe(mockProfile.displayName);
      expect(document.getElementById('profilePicture').src).toBe(mockProfile.pictureUrl);
      expect(document.getElementById('profile').classList.contains('profile--hidden')).toBe(false);
    });

    test('should initialize LIFF, call login, and call updateUserProfile with null when user is not logged in', async () => {
      // Arrange: Mock user as not logged in
      mockLiff.isLoggedIn.mockReturnValue(false);

      // Act: Run the main function
      await actualMain();

      // Assert: Verify that login was called and profile was not fetched/updated
      expect(mockLiff.init).toHaveBeenCalledWith({ liffId: ACTUAL_LIFF_ID });
      expect(mockLiff.isLoggedIn).toHaveBeenCalled();
      expect(mockLiff.login).toHaveBeenCalled();
      expect(mockLiff.getProfile).not.toHaveBeenCalled();

      // Assert DOM changes for hidden profile (actualUpdateUserProfile(null) will be called)
      expect(document.getElementById('userId').textContent).toBe('');
      expect(document.getElementById('displayName').textContent).toBe('');
      expect(document.getElementById('profilePicture').src).toBe('http://localhost/'); // JSDOM resolves empty src
      expect(document.getElementById('profilePicture').style.display).toBe('none');
      expect(document.getElementById('profile').classList.contains('profile--hidden')).toBe(true);
    });

    test('should log an error and call updateUserProfile with null if LIFF initialization fails', async () => {
      // Arrange: Mock an error during initialization
      const initError = new Error('Initialization Failed');
      mockLiff.init.mockRejectedValue(initError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

      await actualMain();

      expect(mockLiff.init).toHaveBeenCalledWith({ liffId: ACTUAL_LIFF_ID });
      expect(console.error).toHaveBeenCalledWith('Error in main LIFF function:', initError);
      expect(mockLiff.login).not.toHaveBeenCalled();
      expect(mockLiff.getProfile).not.toHaveBeenCalled();
      
      // Assert DOM changes for hidden profile (actualUpdateUserProfile(null) will be called)
      expect(document.getElementById('userId').textContent).toBe('');
      expect(document.getElementById('displayName').textContent).toBe('');
      expect(document.getElementById('profilePicture').src).toBe('http://localhost/');
      expect(document.getElementById('profilePicture').style.display).toBe('none');
      expect(document.getElementById('profile').classList.contains('profile--hidden')).toBe(true);
      consoleErrorSpy.mockRestore();
    });

    test('should log an error and call updateUserProfile with null if LIFF SDK is not loaded', async () => {
      const originalLiff = global.liff;
      delete global.liff; // Simulate LIFF SDK not being loaded
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

      await actualMain();

      expect(console.error).toHaveBeenCalledWith('LIFF SDK not loaded. Aborting main function.');
      expect(mockLiff.init).not.toHaveBeenCalled(); // liff.init shouldn't be called
      
      // Assert DOM changes for hidden profile (actualUpdateUserProfile(null) will be called)
      expect(document.getElementById('userId').textContent).toBe('');
      expect(document.getElementById('displayName').textContent).toBe('');
      expect(document.getElementById('profilePicture').src).toBe('http://localhost/');
      expect(document.getElementById('profilePicture').style.display).toBe('none');
      expect(document.getElementById('profile').classList.contains('profile--hidden')).toBe(true);
      consoleErrorSpy.mockRestore();
      global.liff = originalLiff; // Restore LIFF for other tests
    });
  });

  describe('updateUserProfile function', () => {
    test('should correctly set the profile data in the DOM', () => {
        // Arrange
        const profile = {
            userId: 'test-user-id',
            displayName: 'Test Display Name',
            pictureUrl: 'http://test.com/image.png'
        };

        // Act
        actualUpdateUserProfile(profile); // Test the actual implementation

        // Assert
        expect(document.getElementById('userId').textContent).toBe('test-user-id');
        expect(document.getElementById('displayName').textContent).toBe('Test Display Name');
        const profilePic = document.getElementById('profilePicture');
        expect(profilePic.src).toBe('http://test.com/image.png'); // This remains the same as it's a valid URL
        expect(profilePic.alt).toBe("Test Display Name's profile picture");
        expect(profilePic.style.display).toBe('');
        expect(document.getElementById('profile').classList.contains('profile--hidden')).toBe(false);
    });

    test('should hide profile picture and set alt to empty if pictureUrl is not provided', () => {
        const profile = {
            userId: 'test-user-id',
            displayName: 'Test Display Name',
            // No pictureUrl
        };
        actualUpdateUserProfile(profile);

        const profilePic = document.getElementById('profilePicture');
        expect(profilePic.src).toBe('http://localhost/'); // JSDOM resolves empty src to base URL
        expect(profilePic.alt).toBe(''); // Alt text should be empty
        expect(profilePic.style.display).toBe('none');
        expect(document.getElementById('profile').classList.contains('profile--hidden')).toBe(false); // Profile section still visible
    });
    
    test('should hide the profile section and clear data if profile is null', () => {
        // Arrange: Set some initial data to ensure it's cleared
        document.getElementById('userId').textContent = 'old-id';
        document.getElementById('displayName').textContent = 'old-name';
        document.getElementById('profilePicture').src = 'http://example.com/old.jpg';
        document.getElementById('profilePicture').style.display = ''; // This element's display is still directly manipulated
        document.getElementById('profile').classList.remove('profile--hidden'); // Ensure it's visible before test

        actualUpdateUserProfile(null);

        expect(document.getElementById('userId').textContent).toBe('');
        expect(document.getElementById('displayName').textContent).toBe('');
        const profilePic = document.getElementById('profilePicture');
        expect(profilePic.src).toBe('http://localhost/'); // JSDOM resolves empty src to base URL
        expect(profilePic.alt).toBe('');
        expect(profilePic.style.display).toBe('none');
        expect(document.getElementById('profile').classList.contains('profile--hidden')).toBe(true);
    });

    test('should log an error if profile section DOM element is missing', () => {
        document.body.innerHTML = '<div></div>'; // Remove #profile element
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        actualUpdateUserProfile({ userId: 'test' }); // Call with some profile
        expect(consoleErrorSpy).toHaveBeenCalledWith("Profile section DOM element not found.");
        consoleErrorSpy.mockRestore();
    });
  });
});