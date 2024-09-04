<h1 align="center">
  AI or Not
</h1>

<a href="https://aiornot.site/"><img src="/readme/header.png" width="1280" height="260" alt="Project Banner"></a>

<div align="center">
  <a href="https://react.dev/"><img src="/readme/icons/react.png" width="48" height="48" alt="React"></a>&nbsp;
  <a href="https://www.typescriptlang.org/"><img src="/readme/icons/typescript.png" width="48" height="48" alt="Typescript"></a>&nbsp;
  <a href="https://tailwindcss.com/"><img src="/readme/icons/tailwind.png" width="48" height="48" alt="Tailwind"></a>&nbsp;
  <a href="https://developers.google.com/youtube/v3"><img src="/readme/icons/youtube.png" width="48" height="48" alt="Youtube"></a>&nbsp;
  <a href="https://openai.com/api/"><img src="/readme/icons/openai.png" width="48" height="48" alt="Open AI"></a>&nbsp;
</div>

## Overview

<p>AI or Not ([https://aiornot.site](https://aiornot.site)) is an online game where you have to guess whether YouTube comments are real or AI-generated. This game was inspired by the Dead Internet Theory, which argues that most of the internet is filled with bots instead of real humans. I wanted to see if the average person could tell the difference between an AI comment and a real comment.</p>

<p>When you start the game, you'll be presented with a series of YouTube comments and will have to guess whether each comment is AI or not. The goal is to score as high as possible by making the correct guesses, all while a snarky robot host eggs you on.</p>

<br><br><a href="https://aiornot.site/"><img src="/readme/example.png" width="1280" height="260" alt="Gameplay Example"></a>

## How it Works

<p>When you first load up the site, the web app will immediately start fetching 10 top comments from the most popular US videos on YouTube today. It will also start generating comments using OpenAI's GPT-3 model. If the user starts the game before the API fetching is complete, it will randomly select comments from hardcoded data that I previously fetched and turned into JSON. The web app caches 20 comments at a time (10 real and 10 generated) and will asynchronously fetch more comments in the background when it notices the cache running low. This ensures the cache never runs out of comments, and the user has a seamless gaming experience with no loading times.</p>

<p>The AI-generated comments are created using real comments and a video title as reference, so it can create very convincing fake comments that comment on events that happen (or it predicts happens) in the video. The AI also has around 20 personas that it uses to generate convincing comments. These personas range from the kid who repeatedly asks the YouTuber to do something in their next video, to someone that only uses emojis and no words.</p>

<br><br><a href="https://aiornot.site/"><img src="/readme/footer.png" width="1280" height="120" alt="Footer Image"></a>
