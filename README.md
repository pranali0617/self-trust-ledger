<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. In Vercel Project Settings, add an environment variable named `GEMINI_API_KEY`.
4. Deploy.

The app now uses the serverless endpoint in [api/chat.ts](/home/pranali_s/pranali_S_backup_sept_2025/WSS/WSS/self-trust-ledger%20(1)/api/chat.ts), so the Gemini key stays on the server instead of being exposed in the browser bundle.
# self-trust-ledger
