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

// Get the actual LIFF_ID from script.js before mocking the module
// This ensures we use the real LIFF_ID for checking liff.init calls.
const { LIFF_ID: ACTUAL_LIFF_ID } = jest.requireActual('./script.js');

// Mock specific functions from './script.js'
// We want to test `main`'s interaction with `updateUserProfile` (mocked)
// and test `updateUserProfile` (actual) in isolation.
jest.mock('./script.js', () => {
  const originalModule = jest.requireActual('./script.js');
  return {
    __esModule: true, // Important for modules that might use ES6 exports
    ...originalModule, // Spread original module to keep other exports like LIFF_ID
    main: originalModule.main, // We want to test the actual main function
    updateUserProfile: jest.fn(), // Mock updateUserProfile for testing main's calls to it
  };
});

// Import the functions from the (partially) mocked script.js
const { main, updateUserProfile: mockUpdateUserProfile } = require('./script.js');
// For testing the updateUserProfile function itself, we need the original one.
const { updateUserProfile: actualUpdateUserProfile } = jest.requireActual('./script.js');

describe('LIFF Device Registration App', () => {
  // Reset mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = html; // Reset the DOM state for each test
    // Reset liff mock states
    mockLiff.init.mockClear().mockResolvedValue();
    mockLiff.isLoggedIn.mockClear();
    mockLiff.getProfile.mockClear().mockResolvedValue({
        userId: 'defaultUser', displayName: 'Default User', pictureUrl: 'http://example.com/default.jpg',
    });
    mockLiff.login.mockClear();
    mockUpdateUserProfile.mockClear(); // mockUpdateUserProfile is from the jest.mock setup
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
      await main();

      // Assert: Verify that the correct functions were called and the DOM was updated
      expect(mockLiff.init).toHaveBeenCalledWith({ liffId: ACTUAL_LIFF_ID });
      expect(mockLiff.isLoggedIn).toHaveBeenCalled();
      expect(mockLiff.getProfile).toHaveBeenCalled();
      expect(mockUpdateUserProfile).toHaveBeenCalledWith(mockProfile);
      expect(mockLiff.login).not.toHaveBeenCalled();
    });

    test('should initialize LIFF, call login, and call updateUserProfile with null when user is not logged in', async () => {
      // Arrange: Mock user as not logged in
      mockLiff.isLoggedIn.mockReturnValue(false);

      // Act: Run the main function
      await main();

      // Assert: Verify that login was called and profile was not fetched/updated
      expect(mockLiff.init).toHaveBeenCalledWith({ liffId: ACTUAL_LIFF_ID });
      expect(mockLiff.isLoggedIn).toHaveBeenCalled();
      expect(mockLiff.login).toHaveBeenCalled();
      expect(mockLiff.getProfile).not.toHaveBeenCalled();
      expect(mockUpdateUserProfile).toHaveBeenCalledWith(null);
    });

    test('should log an error and call updateUserProfile with null if LIFF initialization fails', async () => {
      // Arrange: Mock an error during initialization
      const initError = new Error('Initialization Failed');
      mockLiff.init.mockRejectedValue(initError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await main();

      expect(mockLiff.init).toHaveBeenCalledWith({ liffId: ACTUAL_LIFF_ID });
      expect(console.error).toHaveBeenCalledWith('Error in main LIFF function:', initError);
      expect(mockLiff.login).not.toHaveBeenCalled();
      expect(mockLiff.getProfile).not.toHaveBeenCalled();
      expect(mockUpdateUserProfile).toHaveBeenCalledWith(null);
      
      consoleErrorSpy.mockRestore();
    });

    test('should log an error and call updateUserProfile with null if LIFF SDK is not loaded', async () => {
      const originalLiff = global.liff;
      delete global.liff; // Simulate LIFF SDK not being loaded
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await main();

      expect(console.error).toHaveBeenCalledWith('LIFF SDK not loaded. Aborting main function.');
      expect(mockLiff.init).not.toHaveBeenCalled(); // liff.init shouldn't be called
      expect(mockUpdateUserProfile).toHaveBeenCalledWith(null);
      
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
        expect(profilePic.src).toBe('http://test.com/image.png');
        expect(profilePic.alt).toBe("Test Display Name's profile picture");
        expect(profilePic.style.display).toBe('');
        expect(document.getElementById('profile').style.display).toBe('flex');
    });

    test('should hide profile picture and set alt to empty if pictureUrl is not provided', () => {
        const profile = {
            userId: 'test-user-id',
            displayName: 'Test Display Name',
            // No pictureUrl
        };
        actualUpdateUserProfile(profile);

        const profilePic = document.getElementById('profilePicture');
        expect(profilePic.src).toBe(''); // Or check it's the base URL if src is set to empty string
        expect(profilePic.alt).toBe('');
        expect(profilePic.style.display).toBe('none');
        expect(document.getElementById('profile').style.display).toBe('flex'); // Profile section still visible
    });
    
    test('should hide the profile section and clear data if profile is null', () => {
        // Arrange: Set some initial data to ensure it's cleared
        document.getElementById('userId').textContent = 'old-id';
        document.getElementById('displayName').textContent = 'old-name';
        document.getElementById('profilePicture').src = 'http://example.com/old.jpg';
        document.getElementById('profilePicture').style.display = '';
        document.getElementById('profile').style.display = 'flex';

        actualUpdateUserProfile(null);

        expect(document.getElementById('userId').textContent).toBe('');
        expect(document.getElementById('displayName').textContent).toBe('');
        const profilePic = document.getElementById('profilePicture');
        expect(profilePic.src).toBe('');
        expect(profilePic.alt).toBe('');
        expect(profilePic.style.display).toBe('none');
        expect(document.getElementById('profile').style.display).toBe('none');
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