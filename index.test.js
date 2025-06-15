/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the HTML file into the DOM environment for testing
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
document.body.innerHTML = html;

// Mock the global liff object before importing the script
const mockLiff = {
  init: jest.fn().mockResolvedValue(),
  isLoggedIn: jest.fn(),
  getProfile: jest.fn(),
  login: jest.fn(),
};
global.liff = mockLiff;

// Import the script file after setting up the mocks
const { main, updateUserProfile } = require('./script.js');

describe('LIFF Device Registration App', () => {

  // Reset mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the DOM state
    document.body.innerHTML = html;
  });

  describe('main function', () => {
    test('should initialize LIFF, get profile, and update DOM when user is logged in', async () => {
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
      expect(mockLiff.init).toHaveBeenCalledWith({ liffId: "2005687951-Y3wNramZ" });
      expect(mockLiff.getProfile).toHaveBeenCalled();
      expect(mockLiff.login).not.toHaveBeenCalled();

      expect(document.getElementById('userId').textContent).toBe(mockProfile.userId);
      expect(document.getElementById('displayName').textContent).toBe(mockProfile.displayName);
      expect(document.getElementById('profilePicture').src).toBe(mockProfile.pictureUrl);
      expect(document.getElementById('profile').style.display).toBe('flex');
    });

    test('should initialize LIFF and call login when user is not logged in', async () => {
      // Arrange: Mock user as not logged in
      mockLiff.isLoggedIn.mockReturnValue(false);

      // Act: Run the main function
      await main();

      // Assert: Verify that login was called and profile was not fetched
      expect(mockLiff.init).toHaveBeenCalledWith({ liffId: "2005687951-Y3wNramZ" });
      expect(mockLiff.login).toHaveBeenCalled();
      expect(mockLiff.getProfile).not.toHaveBeenCalled();
      expect(document.getElementById('profile').style.display).toBe('none');
    });

    test('should log an error if LIFF initialization fails', async () => {
      // Arrange: Mock an error during initialization
      const initError = new Error('Initialization Failed');
      mockLiff.init.mockRejectedValue(initError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act: Run the main function
      await main();

      // Assert: Verify that the error was logged
      expect(console.error).toHaveBeenCalledWith('LIFF Initialization failed', initError);
      expect(mockLiff.login).not.toHaveBeenCalled();
      expect(mockLiff.getProfile).not.toHaveBeenCalled();
      
      // Clean up the spy
      consoleErrorSpy.mockRestore();
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
        updateUserProfile(profile);

        // Assert
        expect(document.getElementById('userId').textContent).toBe('test-user-id');
        expect(document.getElementById('displayName').textContent).toBe('Test Display Name');
        expect(document.getElementById('profilePicture').src).toBe('http://test.com/image.png');
        expect(document.getElementById('profile').style.display).toBe('flex');
    });
  });
});