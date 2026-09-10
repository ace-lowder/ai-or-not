# AI or Not

[> Play AI or Not](https://aiornot.site)

AI or Not is a browser game where players guess whether YouTube comments are real or AI-generated. Built with Next.js, React, and TypeScript, it uses a Next.js route handler to load current YouTube comments and generate comparable AI comments through the OpenAI Responses API. As players score more points, the game uses harder generation prompts; a browser cache keeps rounds moving without repeated API requests.

## Develop locally

You need Git, Node.js 20.9 or newer, npm, and API keys for OpenAI and YouTube Data.

```bash
git clone https://github.com/ace-lowder/ai-or-not.git
cd ai-or-not
npm ci
cp .env.example .env.local
```

Add your development keys to `.env.local`, then start the app:

```bash
npm run dev
```

Open `http://localhost:3000`. Keep API keys in `.env.local`; do not commit or expose them in browser code.

## Commands

- `npm run dev` starts the local app
- `npm run lint` checks the code
- `npm run build` creates a production build
- `npm run start` runs the production build
