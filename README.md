# Speak with Zubi Assignment

This project is a React-based web application designed to demonstrate an interactive AI conversation interface for children. It features an engaging UI where a friendly AI character, "Buddy", discusses an image with the user.

## Project Status & Implementation Note

**Important:** The original goal of this project was to implement a fully real-time AI conversation using the Gemini Multimodal Live API. However, due to technical challenges encountered during the integration process (specifically related to WebSocket stability and audio streaming compatibility), the current version of the application uses a **simulated conversation flow**.

This version demonstrates:

- The intended User Interface (UI) and User Experience (UX).
- React state management for conversation phases (Idle, Listening, Speaking).
- "Tool calls" simulation where the AI highlights parts of the image based on the context.
- Use of the browser's native `SpeechSynthesis` API for text-to-speech output.

## Features

- **Interactive UI**: Colorful, child-friendly design with animations.
- **Simulated Conversation**: A hardcoded script that mimics a natural back-and-forth dialogue about an image of dogs.
- **Visual Feedback**: The image glows and highlights specific emotions (e.g., "Happy", "Curious") to show the AI's "understanding".
- **Timer**: A 1-minute countdown timer to limit the session length.

## Tech Stack

- **Frontend**: React, Vite
- **Styling**: CSS (with animations), Inline styles for dynamic effects
- **Audio**: Web Speech API (`SpeechSynthesis`)

## How to Run

1.  Navigate to the Frontend directory:

    ```bash
    cd Frontend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Start the development server:

    ```bash
    npm run dev
    ```

4.  Open your browser to the local URL (usually `http://localhost:5173`).

## Future Improvements

- integrating the real-time Gemini API once the connection issues are resolved.
- Adding real microphone input for user responses.
- Expanding the conversation logic to be dynamic based on actual user input.
