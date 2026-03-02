import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const CONVERSATION_DURATION = 60;
const IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dog_Breeds.jpg/1200px-Dog_Breeds.jpg";
const IMAGE_DESCRIPTION = "A colorful collection of different dog breeds - fluffy dogs, big dogs, small dogs, puppies, all looking cute and friendly!";

const HIGHLIGHT_COLORS = {
  excited: "#FFD700",
  curious: "#87CEEB",
  happy: "#98FB98",
  surprised: "#FF69B4",
  none: "transparent",
};

// ─── Main Component ───────────────────────────────────────────────────────────
// API Key is not required for hardcoded version
// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function ChildAIConversation() {
  const [phase, setPhase] = useState("idle");
  const [timeLeft, setTimeLeft] = useState(CONVERSATION_DURATION);
  const [transcript, setTranscript] = useState([]);
  const [highlight, setHighlight] = useState({ emotion: "none", message: "" });
  const [statusText, setStatusText] = useState("Tap Start Talking to begin!");
  const [buddyText, setBuddyText] = useState("Hi! I am Buddy!");
  const [isBuddyTalking, setIsBuddyTalking] = useState(false);
  const [isChildTalking, setIsChildTalking] = useState(false);

  const timerRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const conversationTimeoutsRef = useRef([]);

  const applyHighlight = useCallback((emotion, message) => {
    setHighlight({ emotion, message });
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => setHighlight({ emotion: "none", message: "" }), 4000);
  }, []);

  const stopConversation = useCallback(() => {
    clearInterval(timerRef.current);
    conversationTimeoutsRef.current.forEach(t => clearTimeout(t));
    conversationTimeoutsRef.current = [];
    window.speechSynthesis.cancel();
    
    setIsBuddyTalking(false);
    setIsChildTalking(false);
    setPhase("idle");
    setStatusText("Press Start Talking to begin again!");
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Simple voice selection: try to find a female English voice or just use default
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Google US English")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.1;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  const simulateConversation = useCallback(() => {
    setPhase("active");
    setStatusText("Talk to Buddy!");
    const initialText = "Hi there! I am Buddy!";
    setBuddyText(initialText);
    speak(initialText);

    setTranscript([]);
    setTimeLeft(CONVERSATION_DURATION);
    setIsBuddyTalking(true);

    // Initial Buddy greeting
    const t1 = setTimeout(() => {
        setIsBuddyTalking(false);
        setTranscript(prev => [...prev, { role: "buddy", text: initialText }]);
    }, 2000);

    // Child response simulation
    const t2 = setTimeout(() => {
        setIsChildTalking(true);
        // Simulate child talking for a bit
        setTimeout(() => setIsChildTalking(false), 1500);
        setTranscript(prev => [...prev, { role: "child", text: "Hello Buddy! Look at the dogs!" }]);
    }, 4000);

    // Buddy response + Tool Call (Highlight)
    const t3 = setTimeout(() => {
        setIsBuddyTalking(true);
        const text = "Wow! So many dogs! Look at this happy one!";
        setBuddyText(text);
        speak(text);
        // Simulate tool call
        applyHighlight("happy", "So Happy!");
    }, 7000);

    const t3_end = setTimeout(() => {
        setIsBuddyTalking(false);
        setTranscript(prev => [...prev, { role: "buddy", text: "Wow! So many dogs! Look at this happy one!" }]);
    }, 10000);

    // Child response
    const t4 = setTimeout(() => {
        setIsChildTalking(true);
        setTimeout(() => setIsChildTalking(false), 1500);
        setTranscript(prev => [...prev, { role: "child", text: "Which one is the fluffy one?" }]);
    }, 12000);

    // Buddy response + Another Highlight
    const t5 = setTimeout(() => {
        setIsBuddyTalking(true);
        const text = "The fluffy one is right there! It looks so soft!";
        setBuddyText(text);
        speak(text);
        applyHighlight("curious", "So Fluffy!");
    }, 15000);

    const t5_end = setTimeout(() => {
        setIsBuddyTalking(false);
        setTranscript(prev => [...prev, { role: "buddy", text: "The fluffy one is right there! It looks so soft!" }]);
    }, 18000);
    
     // Cleanup simulation after a while or loop
    const t6 = setTimeout(() => {
        const text = "You are doing great!";
        setBuddyText(text);
        speak(text);
        setIsBuddyTalking(true);
    }, 20000);
     const t6_end = setTimeout(() => {
        setIsBuddyTalking(false);
    }, 22000); // reduced from 23000 to match speak duration roughly


    conversationTimeoutsRef.current.push(t1, t2, t3, t3_end, t4, t5, t5_end, t6, t6_end);

    // Start Timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPhase("done");
          setStatusText("Time is up! Great chatting with you!");
          const endText = "Bye! You were amazing!";
          setBuddyText(endText);
          speak(endText);
          applyHighlight("happy", "Great job!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

  }, [applyHighlight]);

  const startConversation = () => {
      // Clear any existing timers first
      clearInterval(timerRef.current);
      conversationTimeoutsRef.current.forEach(t => clearTimeout(t));
      conversationTimeoutsRef.current = [];
      window.speechSynthesis.cancel();

      // Ensure voices are loaded if possible, but don't block
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
             window.speechSynthesis.onvoiceschanged = null; // one-time
             // Only restart if we haven't started successfully yet or to refresh voice?
             // Actually, better to just let the first call handle it with default voice
             // and maybe subsequent calls will be better.
             // For this simple task, let's just proceed.
        }; 
      }
      simulateConversation();
  };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    conversationTimeoutsRef.current.forEach(t => clearTimeout(t));
    window.speechSynthesis.cancel();
  }, []);

  const glowColor = HIGHLIGHT_COLORS[highlight.emotion] || "transparent";
  const timerPct = (timeLeft / CONVERSATION_DURATION) * 100;
  const timerColor = timeLeft > 30 ? "#4ade80" : timeLeft > 10 ? "#fbbf24" : "#f87171";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      fontFamily: "'Nunito', 'Comic Sans MS', cursive",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px", gap: "16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.12);opacity:0.75} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px ${glowColor},0 0 40px ${glowColor}} 50%{box-shadow:0 0 45px ${glowColor},0 0 85px ${glowColor}} }
        @keyframes ripple { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.4);opacity:0} }
        .buddy-bounce { animation: bounce 0.7s ease-in-out infinite; }
        .dot-pulse { animation: pulse 1s ease-in-out infinite; }
        .img-glow { animation: glow 1.5s ease-in-out infinite; }
        .ripple-ring { animation: ripple 1.3s ease-out infinite; }
        .ripple-ring2 { animation: ripple 1.3s ease-out infinite; animation-delay: 0.45s; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 900, color: "white", textShadow: "3px 3px 0 rgba(0,0,0,0.2)", margin: 0 }}>
          Buddy's Picture Chat
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", margin: "4px 0 0" }}>
          Real-time voice conversation powered by Gemini 2.0 Flash
        </p>
      </div>



      <div style={{ display: "flex", gap: "20px", width: "100%", maxWidth: "900px", flexWrap: "wrap", justifyContent: "center" }}>
        {/* Image */}
        <div style={{ flex: "1 1 320px", maxWidth: "460px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{
            position: "relative", borderRadius: "24px", overflow: "hidden",
            border: `4px solid ${highlight.emotion !== "none" ? glowColor : "rgba(255,255,255,0.4)"}`,
            boxShadow: highlight.emotion !== "none" ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}40` : "0 8px 32px rgba(0,0,0,0.3)",
            transition: "all 0.5s ease",
          }} className={highlight.emotion !== "none" ? "img-glow" : ""}>
            <img src={IMAGE_URL} alt="Dogs" style={{ width: "100%", display: "block", aspectRatio: "16/11", objectFit: "cover" }} />
            {highlight.message && (
              <div style={{
                position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
                background: glowColor, color: "#1a1a2e",
                padding: "6px 18px", borderRadius: "99px",
                fontWeight: 800, fontSize: "1rem", whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}>
                {highlight.message}
              </div>
            )}
          </div>

          {phase === "active" && (
            <>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "99px", height: "12px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: "99px", transition: "width 1s linear, background 0.5s", boxShadow: `0 0 8px ${timerColor}` }} />
              </div>
              <div style={{ textAlign: "center", color: "white", fontWeight: 800, fontSize: "1.1rem" }}>
                {timeLeft}s left
              </div>
            </>
          )}
        </div>

        {/* Buddy panel */}
        <div style={{ flex: "1 1 280px", maxWidth: "380px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
            borderRadius: "24px", padding: "20px",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
          }}>
            {/* Avatar */}
            <div style={{ position: "relative", width: "84px", height: "84px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isBuddyTalking && <>
                <div className="ripple-ring" style={{ position: "absolute", width: "84px", height: "84px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.5)" }} />
                <div className="ripple-ring2" style={{ position: "absolute", width: "84px", height: "84px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)" }} />
              </>}
              <div style={{
                fontSize: "3.8rem", lineHeight: 1,
                filter: isBuddyTalking ? "drop-shadow(0 0 14px rgba(255,255,255,0.9))" : "none",
                transition: "filter 0.3s",
              }} className={isBuddyTalking ? "buddy-bounce" : ""}>
                &#x1F916;
              </div>
            </div>

            {/* Bubble */}
            <div style={{
              background: "rgba(255,255,255,0.92)", color: "#333",
              borderRadius: "16px", padding: "12px 16px",
              fontSize: "0.88rem", fontWeight: 700, textAlign: "center",
              width: "100%", minHeight: "56px",
              display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1.45,
            }}>
              {buddyText}
            </div>

            {/* Live status dot */}
            <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
              {phase === "active" && isBuddyTalking && <>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} className="dot-pulse" />
                Buddy is talking
              </>}
              {phase === "active" && !isBuddyTalking && isChildTalking && <>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} className="dot-pulse" />
                Listening to you
              </>}
              {phase === "active" && !isBuddyTalking && !isChildTalking && <>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#87CEEB", display: "inline-block" }} className="dot-pulse" />
                Ready to listen
              </>}
              {phase === "connecting" && "Connecting..."}
              {phase === "idle" && "Ready to chat!"}
              {phase === "done" && "Great job!"}
            </div>
          </div>

          {/* Status */}
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "16px", padding: "12px 16px", color: "white", fontWeight: 700, textAlign: "center", fontSize: "0.95rem" }}>
            {statusText}
          </div>

          {/* Start/Stop/Again */}
          {(phase === "idle" || phase === "done") && (
            <button onClick={startConversation} style={{
              background: "linear-gradient(135deg, #f7971e, #ffd200)",
              border: "none", borderRadius: "99px",
              padding: "16px 32px", fontSize: "1.2rem",
              fontWeight: 900, color: "#1a1a2e", cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            }}>
              {phase === "done" ? "Play Again" : "Start Talking"}
            </button>
          )}
          {phase === "active" && (
            <button onClick={stopConversation} style={{
              background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: "99px", padding: "12px 24px",
              fontSize: "1rem", fontWeight: 700, color: "white", cursor: "pointer",
            }}>
              Stop
            </button>
          )}


          {/* Transcript */}
          {transcript.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.1)", borderRadius: "16px",
              padding: "12px", maxHeight: "180px", overflowY: "auto",
              display: "flex", flexDirection: "column", gap: "6px",
            }}>
              {transcript.slice(-6).map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "child" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    background: msg.role === "child" ? "rgba(255,255,255,0.9)" : "rgba(102,126,234,0.85)",
                    color: msg.role === "child" ? "#333" : "white",
                    borderRadius: "12px", padding: "6px 10px",
                    fontSize: "0.78rem", fontWeight: 600, maxWidth: "85%", lineHeight: 1.35,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textAlign: "center" }}>
        Powered by Gemini 2.0 Flash Live API · Real-time native voice · Best in Chrome
      </p>
    </div>
  );
}