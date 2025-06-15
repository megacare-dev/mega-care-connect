# Mega Care Connect

---

## Overview

Mega Care Connect is a simple LINE Front-end Framework (LIFF) application (LIFF number: `2005687951-Y3wNramZ`) designed to demonstrate a complete CI/CD workflow. This application authenticates users, displays their LINE profile information, and is automatically deployed to Google Cloud Run from GitHub using Google Cloud Build.

This project serves as a foundational template for creating, containerizing, and deploying modern serverless web applications integrated with the LINE platform.

---

## Key Features

* **LINE Integration:** Seamlessly integrates with LINE Login using the LIFF SDK.
* **User Profile Display:** Retrieves and displays the user's LINE ID, Display Name, and Profile Picture.
* **Containerized:** Packaged as a lightweight Docker container using Nginx to serve static content.
* **Automated Deployment:** Features a full CI/CD pipeline that automatically builds and deploys the application on every push to the `main` branch.
* **Serverless:** Deployed on Google Cloud Run, a fully managed serverless platform that scales automatically.
* **Configured for LINE Mini App:** Set up to be registered and reviewed as a LINE Mini App for enhanced discoverability within the LINE ecosystem.

---

## Technology Stack

* **Frontend:** HTML5, JavaScript (ES6+), LINE LIFF SDK v2
* **Serving:** Docker, Nginx
* **Cloud Platform:** Google Cloud Platform (GCP)
* **Compute:** Google Cloud Run
* **CI/CD:** Google Cloud Build
* **Container Registry:** Google Artifact Registry

---

## Project Structure
