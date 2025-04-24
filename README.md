# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d5499f96-ab29-4a8b-8421-e84614abd1a9

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d5499f96-ab29-4a8b-8421-e84614abd1a9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase (Authentication, Firestore, Storage)

## Using Firebase Emulators

This project supports Firebase emulators for local development. Emulators allow you to develop and test your application without connecting to the production Firebase services.

### Starting the Emulators

To start the Firebase emulators, you need to have the Firebase CLI installed:

```sh
# Install Firebase CLI globally if you don't have it
npm install -g firebase-tools

# Login to Firebase (only needed once)
firebase login

# Start the emulators
firebase emulators:start
```

### Configuring the Application to Use Emulators

The application is configured to automatically connect to emulators in development mode. You can control this behavior with environment variables:

1. Create a `.env.local` file in the root of your project with the following content:

```
# Set to "true" to force using emulators, "false" to disable them
VITE_USE_FIREBASE_EMULATORS=true
```

2. By default, in development mode (`npm run dev`), the application will connect to emulators unless explicitly disabled.

3. In production builds, emulators are disabled by default.

### Emulator Ports

The following emulators are configured:

- Authentication: http://localhost:9099
- Firestore: http://localhost:8080
- Storage: http://localhost:9199
- Functions: http://localhost:5001
- Hosting: http://localhost:5000
- Emulator UI: http://localhost:4000

### Visual Indicator

When using emulators in development mode, a red "Firebase Emulators Active" indicator will appear in the bottom right corner of the application.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d5499f96-ab29-4a8b-8421-e84614abd1a9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

