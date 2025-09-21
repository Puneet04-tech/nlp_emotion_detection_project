Hugging Face Token Setup

This project uses the Hugging Face Inference API for emotion models. You can configure the API token in two ways:

1) Environment variable (recommended for local development)

- Copy `.env.example` to `.env` at the project root.
- Add your token using the Vite prefix so it will be available as `import.meta.env`:

  VITE_HUGGINGFACE_API_KEY=hf_xxxYOURTOKENxxx

- Restart the dev server (Vite) after editing `.env`.

2) In-app runtime configuration (no restart needed)

- Open the Voice Emotion System UI in your browser.
- Open the Settings / API Keys panel.
- Paste your Hugging Face token into the "HuggingFace API Key" field and click Save.
- The token is stored in `localStorage` under the key `api_huggingface`.

3) Verify the token

- In the browser console, open the app and run:

  localStorage.getItem('api_huggingface')

- Or check `import.meta.env.VITE_HUGGINGFACE_API_KEY` from within the app code.

4) Troubleshooting

- If calls to the Hugging Face API fail, check the response code and message in the browser console.
- Ensure your token begins with `hf_` and has sufficient privileges for the target model.
- If you see rate-limit errors (429), consider using a different model endpoint or batching requests.

Security note: Never commit `.env` or your tokens to source control. Use `.gitignore` to exclude `.env` files.
