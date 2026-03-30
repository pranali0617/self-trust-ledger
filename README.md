<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `GROQ_API_KEY` and `GROQ_MODEL` in `.env`
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. In Vercel Project Settings, add `GROQ_API_KEY` and `GROQ_MODEL`.
4. Deploy.

Suggested values:

- `GROQ_API_KEY=<your key>`
- `GROQ_MODEL=llama-3.1-8b-instant`

The app now uses the serverless endpoint in [api/chat.ts](/home/pranali_s/pranali_S_backup_sept_2025/WSS/WSS/self-trust-ledger%20(1)/api/chat.ts), so the Groq key stays on the server instead of being exposed in the browser bundle.
# self-trust-ledger
