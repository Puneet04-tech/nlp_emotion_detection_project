# Speech Summarizer

A modern web application that captures speech through your microphone and generates intelligent summaries of what was spoken.

## Features

- **Real-time Speech Recognition**: Continuously captures and transcribes speech
- **Intelligent Summarization**: Automatically generates concise summaries using advanced text processing
- **Live Transcript**: See your words appear in real-time as you speak
- **Session Tracking**: Monitor speaking duration and word count
- **Download Capability**: Export your transcripts and summaries as text files
- **Modern UI**: Beautiful, responsive interface with smooth animations
- **Error Handling**: Comprehensive error handling for microphone and browser issues

## How to Use

1. **Start Speaking**: Click the microphone button to begin speech recognition
2. **Watch Live Transcript**: Your words will appear in real-time in the transcript section
3. **Generate Summary**: Click "Summarize" to create an intelligent summary of your speech
4. **Download Results**: Use the download button to save your transcript and summary
5. **Clear Session**: Start fresh with the clear button

## Browser Compatibility

This application works best with:
- Google Chrome (recommended)
- Microsoft Edge
- Safari
- Firefox (with limited speech recognition support)

**Note**: Microphone permissions are required for speech recognition to work.

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3001`

4. Allow microphone permissions when prompted

## Technical Features

### Speech Recognition
- Continuous speech capture
- Real-time transcription
- Multi-language support (currently set to English)
- Robust error handling

### Text Summarization
- Extractive summarization algorithm
- Sentence scoring based on word frequency
- Position-based sentence weighting
- Automatic length optimization (approximately 30% of original text)

### User Experience
- Responsive design for all screen sizes
- Visual feedback for listening states
- Session statistics and tracking
- Export functionality

## File Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # Styling and animations
├── main.jsx         # React entry point
└── index.css        # Global styles
```

## Keyboard Shortcuts

- **Spacebar**: Start/stop listening (when microphone button is focused)
- **Enter**: Generate summary (when summarize button is focused)
- **Escape**: Clear session

## Privacy & Security

- All speech processing happens locally in your browser
- No data is sent to external servers
- Microphone access is only used during active listening sessions
- Transcripts and summaries are stored locally until cleared

## Troubleshooting

### Microphone Not Working
1. Check browser permissions for microphone access
2. Ensure no other applications are using the microphone
3. Try refreshing the page and allowing permissions again

### Speech Not Recognized
1. Speak clearly and at a moderate pace
2. Ensure you're in a quiet environment
3. Check your microphone volume levels
4. Try moving closer to your microphone

### Browser Compatibility Issues
1. Use Google Chrome for the best experience
2. Update your browser to the latest version
3. Enable JavaScript in your browser settings

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Dependencies

- React 18+ for the UI framework
- React Icons for beautiful icons
- Vite for fast development and building

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.

---

## Common Causes & Solutions

### 1. **Backend Server Not Running**
- Make sure you have started your Node.js backend:
  ```bash
  npm start
  ```
  in your `backend/` folder.
- You should see a message like:  
  `Backend server running on http://localhost:5001`

---

### 2. **CORS (Cross-Origin Resource Sharing) Issue**
- If your frontend is running on a different port (e.g., `localhost:3000`), the backend must allow CORS.
- **Solution:**  
  Add CORS support to your backend.  
  In your `backend/index.js`, add at the top:
  ```js
  import cors from 'cors';
  app.use(cors());
  ```
  And add `cors` to your `package.json` dependencies:
  ```bash
  npm install cors
  ```

---

### 3. **Wrong URL or Port**
- Double-check that the URL in your React app matches the backend server address and port:
  ```js
  const BACKEND_TRANSCRIBE_URL = 'http://localhost:5001/api/transcribe';
  ```
- If you changed the port, update it in both places.

---

### 4. **Firewall/Network Issues**
- Make sure nothing is blocking connections to `localhost:5001`.

---

## What To Do

1. **Start your backend server** (`npm start` in the backend folder).
2. **Add CORS support** if you haven't already.
3. **Try again** to upload a video/audio file.

---

**If you want, I can show you exactly where and how to add CORS to your backend code. Would you like that?**

---

## 1. **Is the Backend Server Running?**
- In your backend folder, run:
  ```bash
  npm start
  ```
- You should see:
  ```
  Backend server running on http://localhost:5001
  ```
- If you see an error, fix it first.

---

## 2. **Is the Backend Accessible?**
- Open your browser and go to:  
  [http://localhost:5001](http://localhost:5001)
- You should see a message like "Cannot GET /" or similar (this is normal).
- If you get a connection error, your backend is not running or is blocked.

---

## 3. **Is the URL Correct in Your React App?**
- In your React code, make sure you have:
  ```js
  const BACKEND_TRANSCRIBE_URL = 'http://localhost:5001/api/transcribe';
  ```
- If your backend is running on a different port or host, update this URL.

---

## 4. **Is CORS Installed and Used?**
- In `backend/index.js` you should have:
  ```js
  import cors from 'cors';
  app.use(cors());
  ```
- And you should have run:
  ```bash
  npm install cors
  ```

---

## 5. **Check the Browser Console for More Details**
- Open DevTools (F12) → Console and Network tabs.
- Try uploading a file and look for:
  - CORS errors (red text about "Access-Control-Allow-Origin")
  - Network errors (status code, connection refused, etc.)

---

## 6. **Check for Firewall/Antivirus Blocking**
- Some antivirus or firewall software can block local ports.
- Try temporarily disabling them or use a different port (e.g., 5002).

---

## 7. **Check for HTTPS/HTTP Mismatch**
- If your frontend is running on HTTPS and backend on HTTP, some browsers block the request.
- For local development, run both on HTTP.

---

## 8. **Try a Simple Test with curl or Postman**
- In your backend folder, upload a small video file using curl:
  ```bash
  curl -F "video=@path/to/video.mp4" http://localhost:5001/api/transcribe
  ```
- If this fails, the backend is not working or not accessible.

---

## 9. **Check for Proxy Issues (if using Vite/CRA)**
- If you use a proxy in your frontend dev server, make sure it's set up correctly.

---

## 10. **Check for Backend Errors**
- Look at your backend terminal for any error messages when you try to upload.

---

### **If you try all of the above and it still fails:**
- Please copy and paste:
  - The exact error message from the browser console (not just the UI).
  - Any error message from your backend terminal.
  - Confirm if you can access [http://localhost:5001](http://localhost:5001) in your browser.

**Let me know what you find, and I’ll help you fix it!**
