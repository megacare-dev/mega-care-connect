# mega-care-connect
Mega Care Connect LIFF App

A simple LINE Front-end Framework (LIFF) application designed to demonstrate a complete CI/CD workflow. The application authenticates a user, displays their LINE profile information, and is automatically deployed to Google Cloud Run from GitHub using Google Cloud Build.

This project serves as a foundational template for creating, containerizing, and deploying modern serverless web applications integrated with the LINE platform.

Key Features
LINE Integration: Seamlessly integrates with LINE Login using the LIFF SDK.
User Profile Display: Retrieves and displays the user's LINE ID, Display Name, and Profile Picture.
Containerized: Packaged as a lightweight Docker container using Nginx to serve the static content.
Automated Deployment: Features a full CI/CD pipeline that automatically builds and deploys the application on every push to the main branch.
Serverless: Deployed on Google Cloud Run, a fully managed serverless platform that scales automatically.
Configured for LINE Mini App: Set up to be registered and reviewed as a LINE Mini App for enhanced discoverability within the LINE ecosystem.
Technology Stack
Frontend: HTML5, JavaScript (ES6+), LINE LIFF SDK v2
Serving: Docker, Nginx
Cloud Platform: Google Cloud Platform (GCP)
Compute: Google Cloud Run
CI/CD: Google Cloud Build
Container Registry: Google Artifact Registry
Project Structure
/
├── .gitignore
├── cloudbuild.yaml   # Defines the CI/CD pipeline steps
├── Dockerfile        # Defines the Docker container
└── index.html        # The main LIFF application page
Configuration
Before the application can function, you must configure it with your unique LIFF ID from the LINE Developers Console.

Open the index.html file.
Find the following line of JavaScript:
JavaScript

await liff.init({ liffId: "YOUR_LIFF_ID" }); // 👈 PASTE YOUR LIFF ID HERE
Replace "YOUR_LIFF_ID" with the actual LIFF ID for your LINE Mini App channel.
Local Development
To test and develop the application on your local machine, you need a way for the LINE mobile app to access your local server. We use ngrok for this.

Prerequisites:

ngrok installed and configured.
Python 3 or another local web server.
Steps:

Start a local web server in the project's root directory.

Bash

python3 -m http.server 8080
Expose your local server to the internet using ngrok. Open a new terminal window and run:

Bash

ngrok http 8080
Update the Endpoint URL: ngrok will give you a public HTTPS URL (e.g., https://xxxx-xx-xx-xx.ngrok-free.app). Copy this URL and paste it into the "Endpoint URL" field of your LIFF app settings in the LINE Developers Console.

Open the LIFF URL on your phone to see your local changes live.

Deployment
This project is configured for Continuous Deployment. The pipeline is defined in cloudbuild.yaml.

Trigger: Any git push to the main branch on GitHub.
Platform: Google Cloud Build.
The pipeline performs the following steps automatically:

Builds the Docker image based on the Dockerfile.
Pushes the new image to Google Artifact Registry (asia-southeast1-docker.pkg.dev/mega-care-dev/mega-care-connect-repo).
Deploys the new image revision to the mega-care-connect-service on Google Cloud Run in the asia-southeast1 (Singapore) region.
License
This project is licensed under the MIT License.

