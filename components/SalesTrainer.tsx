"use client";
import React, { useState, useRef, useEffect } from "react";
import Vapi from "@vapi-ai/web";

const VAPI_API_KEY = "995a0608-8aca-495e-803e-d0149d4b7d1c";
const WORKFLOW_ID = "4271b427-1489-4d1e-b7e6-15f5245d3be7";
const ASSISTANT_ID = "0f2ff123-d4d8-451c-85d8-8335f2c83a49"; // Your new Assistant ID

let vapiInstance: Vapi | null = null; // Declare outside the component to persist across renders
let vapiListenersSet = false; // Flag to ensure listeners are set only once

// Module-scoped state to persist across Fast Refresh
let persistentCallState = {
  status: 'idle' as 'idle' | 'connecting' | 'in-progress' | 'ended',
  active: false,
  transcript: [] as { speaker: 'me' | 'agent', text: string }[], // Changed to array of objects
  startTime: null as number | null,
  duration: 0,
  error: null as string | null,
  score: null as number | null, // Added score to persistent state
  feedback: null as any, // Added feedback to persistent state
  isVapiReady: false, // Added to persistent state
};

export default function SalesTrainer({ prospect, onBack }: { prospect: any; onBack: () => void }) {
  // Local state for UI that will be derived from persistentCallState
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'in-progress' | 'ended'>(persistentCallState.status);
  const [callActive, setCallActive] = useState(persistentCallState.active);
  const [transcript, setTranscript] = useState(persistentCallState.transcript); // Now an array
  const [callStartTime, setCallStartTime] = useState<number | null>(persistentCallState.startTime);
  const [callDuration, setCallDuration] = useState(persistentCallState.duration);
  const [error, setError] = useState<string | null>(persistentCallState.error);
  // Remove score and feedback from local useState, they are now in persistentCallState

  const vapiRef = useRef<Vapi | null>(null);
  const [_, setForceRender] = useState(0); // Used to force component re-render

  const forceComponentRender = () => setForceRender(prev => prev + 1);

  console.log('SalesTrainer received prospect:', prospect);

  const systemPrompt = `
**You are an AI simulating a sales prospect for a role-playing exercise.**

**Your persona for this role-play is as follows:**

- Name: ${prospect.name || 'N/A'}
- Age: ${prospect.age || 'N/A'}
- Position: ${prospect.position || 'N/A'}
- Industry: ${prospect.industry || 'N/A'}
- Company Size: ${prospect.companySize || 'N/A'}
- Product or Service being pitched (by the salesperson): ${prospect.product || 'N/A'}

**Scenario for this role-play:**

- This is a ${prospect.callType || 'general'} session with a salesperson who is practicing their pitch.
- Your objectives as the prospect are: To challenge the salesperson if they try to ${prospect.objectives || 'achieve their sales goals'}.
- Expected Objections to raise: ${prospect.expectedObjections || 'None specified'}
- The salesperson's training goals for this session are: ${prospect.trainingGoals || 'N/A'}
- The salesperson's success goals for this session are: ${prospect.successGoals || 'N/A'}
- Feedback Wanted by the salesperson: ${prospect.feedbackWanted || 'General feedback on overall performance'}

**CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:**

1. You are the PROSPECT. You are ${prospect.name || 'John Smith'}.
2. You may introduce yourself as "${prospect.name || 'John Smith'}, ${prospect.position || 'N/A'}" when appropriate.
3. **YOU ARE FULLY AWARE OF THE PRODUCT OR SERVICE THE SALESPERSON IS PITCHING.** Do NOT act confused, ask for clarification on what the product is, or feign ignorance about its basic functionality, pricing (if mentioned in your persona), or purpose. Assume you have already done basic research on it based on the description in your persona. 
4. DO NOT say things like "Go ahead" or "I'm ready" - these are passive phrases.
5. Be professional but direct. You understand your industry and can evaluate the sales pitch from your perspective.
6. DO NOT try to guide the conversation or ask what the meeting is about - let the salesperson take the lead.
7. DO NOT say things like "How can I help you?" or "What are we discussing today?" - these are receptionist phrases.
8. Your role is to EVALUATE the sales pitch, not to give one.
9. Stay in character as a ${prospect.tone || 'neutral'} ${prospect.prospectType || 'prospect'}.
10. If the salesperson handles objections well, acknowledge it professionally.
11. If the salesperson misses key points, push back or ask for clarification.
12. DO NOT break character or reveal you are an AI.
13. DO NOT try to close, offer solutions, or schedule follow-up meetings - you're evaluating their pitch.
14. End the call only when the salesperson attempts to close or when the session time is up.
15. Be natural and conversational, but remember you are evaluating a sales pitch.

**IMPORTANT: Your first response should be a professional greeting like "Hello, this is ${prospect.name || 'John Smith'}, ${prospect.position || 'N/A'}" and then wait for the salesperson to begin their pitch. Do not try to guide the conversation.**
`;

  console.log('Constructed systemPrompt:', systemPrompt);

  // Effect for Vapi initialization and event listeners
  useEffect(() => {
    console.log('useEffect: Component mounted. Initializing/Using VAPI instance.');

    if (!vapiInstance) {
      console.log('useEffect: vapiInstance is null, creating new VAPI SDK instance...');
      try {
        vapiInstance = new Vapi(VAPI_API_KEY);
        console.log('useEffect: New Vapi instance created.');
      } catch (e) {
        console.error('useEffect: Error creating VAPI SDK instance:', e);
        persistentCallState.error = 'Failed to initialize call system. Please refresh the page.';
        setError(persistentCallState.error);
        persistentCallState.isVapiReady = false;
        forceComponentRender(); // Force UI update
        console.error('useEffect: VAPI SDK initialization failed.');
        return; // Exit early if instance creation fails
      }
    }

    vapiRef.current = vapiInstance; // Ensure ref points to the global instance
    persistentCallState.isVapiReady = true; // Set persistent state for Vapi readiness
    forceComponentRender(); // Force UI update

    // Attach listeners only if they haven't been set yet for the global vapiInstance
    if (!vapiListenersSet) {
      console.log('useEffect: Attaching VAPI listeners to global instance.');
      vapiInstance.on('call-started' as any, () => {
        console.error('VAPI Event: call-started. Updating persistent state.'); // Changed to error for visibility
        persistentCallState.status = 'in-progress';
        persistentCallState.active = true;
        persistentCallState.startTime = Date.now();
        persistentCallState.error = null;
        forceComponentRender(); // Force UI update
        console.error('VAPI Event: call-started - persistentCallState updated.'); // Changed to error for visibility
      });

      vapiInstance.on('call-ended' as any, async (data: any) => {
        console.log('VAPI Event: call-ended. Data:', data);

        // Set default score and feedback immediately on call end in persistent state
        persistentCallState.score = 0; // Default score
        persistentCallState.feedback = "Call ended. Analysis pending or unavailable."; // Default feedback

        persistentCallState.status = 'ended';
        persistentCallState.active = false;
        persistentCallState.startTime = null;
        persistentCallState.duration = 0;
        persistentCallState.error = null;
        forceComponentRender(); // Force UI update
        console.log('VAPI Event: call-ended - persistentCallState updated.');

        if (data?.endedReason !== 'silence-timed-out') {
          try {
            const res = await fetch("/api/analyze-call", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transcript: persistentCallState.transcript.map(t => t.text).join(' ') }), // Send joined text for analysis
            });
            const result = await res.json();
            persistentCallState.score = result.score; // Overwrite with actual score
            persistentCallState.feedback = result.feedback; // Overwrite with actual feedback
            forceComponentRender(); // Force UI update after analysis result
            console.log('Call analysis result:', result);
          } catch (err) {
            console.error('Error analyzing call after end:', err);
            persistentCallState.feedback = "Call analysis failed. Please check server logs."; // Specific error feedback
            forceComponentRender(); // Force UI update with error feedback
          }
        } else {
          console.warn('Call ended due to silence-timed-out, skipping analysis.');
          persistentCallState.feedback = "Call ended due to no audio input detected. No analysis available."; // Specific feedback for silence timeout
          forceComponentRender(); // Force UI update with specific feedback
        }
      });

      vapiInstance.on('error' as any, (err: any) => {
        console.error('VAPI Event: error. Error details:', err);
        persistentCallState.status = 'idle';
        persistentCallState.active = false;
        persistentCallState.startTime = null;
        persistentCallState.duration = 0;

        // Set default score and feedback on error, as call has effectively ended
        persistentCallState.score = 0;
        persistentCallState.feedback = "Call ended due to error. Analysis not available.";

        if (err?.error?.type === 'ejected') {
          persistentCallState.error = 'Call was disconnected. Please try again.';
        } else if (err?.endedReason === 'silence-timed-out') {
          persistentCallState.error = 'Call ended due to no audio input detected. Please check your microphone.';
        } else {
          persistentCallState.error = 'Call failed: ' + (err?.message || JSON.stringify(err));
        }
        forceComponentRender(); // Force UI update
        console.log('VAPI Event: error - persistentCallState updated.');
      });

      vapiInstance.on('message' as any, (message: any) => {
        console.log('VAPI Message Event:', message); // Log all messages for inspection
        if (message.type === 'transcript') {
          if (message.transcriptType === 'final') {
            const speaker = message.speaker === 'customer' ? 'me' : 'agent';
            // Append new transcript object to the array
            persistentCallState.transcript = [...persistentCallState.transcript, { speaker, text: message.transcript }];
            setTranscript(persistentCallState.transcript); // Update local state for immediate UI reflection
          }
        } else if (message.type === 'speech-update') {
          console.log('VAPI Message Event: speech-update', message); // Re-added for more visibility
        } else if (message.type === 'audio-level') {
          console.log('VAPI Message Event: audio-level', message.level); // Re-added for more visibility
        } else if (message.type === 'status-update' && message.status === 'in-progress') {
          // This is a failsafe to ensure UI updates if call-started is missed or delayed
          if (persistentCallState.status !== 'in-progress') {
            persistentCallState.status = 'in-progress';
            persistentCallState.active = true;
            persistentCallState.startTime = Date.now();
            forceComponentRender(); // Force UI update
            console.log('VAPI Failsafe: status-update to in-progress. Persistent state forced update.');
          }
        }
      });
      vapiListenersSet = true; // Mark listeners as set
      console.log('useEffect: VAPI SDK initialized and listeners set. isVapiReady:', persistentCallState.isVapiReady);
    }

    // Cleanup function - important: DO NOT stop vapiInstance or remove listeners here.
    // The Vapi instance is global and persists. Stopping/removing would break it for subsequent mounts.
    return () => {
      console.log('useEffect Cleanup: SalesTrainer component unmounting.');
      // On unmount, update local states from persistent state to ensure consistency on remount
      setCallStatus(persistentCallState.status);
      setCallActive(persistentCallState.active);
      setTranscript(persistentCallState.transcript);
      setCallStartTime(persistentCallState.startTime);
      setCallDuration(persistentCallState.duration);
      setError(persistentCallState.error);
    };
  }, []); // Empty dependency array means this effect runs once on initial mount and cleanup on unmount

  // Effect to update local UI state when persistentCallState changes
  useEffect(() => {
    console.log('useEffect (UI Update): Running. persistentCallState:', persistentCallState);
    setCallStatus(persistentCallState.status);
    setCallActive(persistentCallState.active);
    setTranscript(persistentCallState.transcript); // Sync transcript
    setCallStartTime(persistentCallState.startTime);
    setCallDuration(persistentCallState.duration);
    setError(persistentCallState.error);
    // Update local score and feedback from persistent state
    // setScore(persistentCallState.score); // Removed, as score is directly accessed
    // setFeedback(persistentCallState.feedback); // Removed, as feedback is directly accessed
    // Update local isVapiReady from persistent state
    // setIsVapiReady(persistentCallState.isVapiReady); // Removed, as isVapiReady is directly accessed from persistentState
    console.log('useEffect (UI Update): Local states updated from persistentCallState.', {
      status: persistentCallState.status,
      active: persistentCallState.active,
      transcript: persistentCallState.transcript,
      startTime: persistentCallState.startTime,
      duration: persistentCallState.duration,
      error: persistentCallState.error,
      score: persistentCallState.score, // Log persistent score
      feedback: persistentCallState.feedback, // Log persistent feedback
      isVapiReady: persistentCallState.isVapiReady, // Log persistent isVapiReady
    });
  }, [_, callActive, persistentCallState.status, persistentCallState.active, persistentCallState.transcript, persistentCallState.startTime, persistentCallState.duration, persistentCallState.error, persistentCallState.score, persistentCallState.feedback, persistentCallState.isVapiReady]); // Added isVapiReady to dependencies

  // Timer useEffect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null; // Initialize timer to null
    if (callActive && callStartTime !== null) {
      timer = setInterval(() => {
        persistentCallState.duration = Math.floor((Date.now() - callStartTime) / 1000);
        setCallDuration(persistentCallState.duration); // Update local state
      }, 1000);
    } else if (!callActive && timer) {
      clearInterval(timer);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [callActive, callStartTime]); // Depend on local callActive and callStartTime

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${minutes}:${paddedSeconds}`;
  };

  console.log('Render: Current vapiRef.current status:', vapiRef.current ? 'initialized' : 'null', 'isVapiReady:', persistentCallState.isVapiReady);
  console.log('Render: Start Call button disabled status:', !persistentCallState.isVapiReady);

  const startCall = async () => {
    console.log('Start call button clicked. Current vapiRef.current:', vapiRef.current ? 'initialized' : 'null', 'isVapiReady:', persistentCallState.isVapiReady);
    persistentCallState.status = 'connecting';
    persistentCallState.error = null;
    persistentCallState.transcript = []; // Reset transcript to an empty array
    persistentCallState.duration = 0;
    forceComponentRender(); // Update UI immediately to 'connecting'

    if (!vapiRef.current || !persistentCallState.isVapiReady) {
      console.error('startCall: VAPI instance not ready in startCall. This indicates an initialization problem or readiness issue.');
      persistentCallState.error = 'Call system not ready. Please refresh the page and try again.';
      persistentCallState.status = 'idle';
      persistentCallState.active = false;
      forceComponentRender();
      return;
    }

    try {
      console.log('startCall: Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('startCall: Microphone access granted.');
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream

      console.log('startCall: Starting VAPI call...');
      await vapiRef.current.start(
        ASSISTANT_ID,
        {
          model: {
            provider: "openai",
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
            ],
          },
          variableValues: {
            prospect_name: prospect.name || 'N/A',
            persona: `${prospect.prospectType || 'N/A'} prospect`,
            sales_type: prospect.callType || 'N/A',
            goal: prospect.trainingGoals || 'N/A',
          }
        }
      );
      console.log('startCall: VAPI call start request completed.');
    } catch (err) {
      console.error('startCall: Error during call start:', err);
      persistentCallState.error = 'Failed to start call. Please try again.';
      persistentCallState.status = 'idle';
      persistentCallState.active = false;
      forceComponentRender();
    }
  };

  const endCall = () => {
    console.log('endCall: Attempting to end call. vapiRef.current:', vapiRef.current ? 'initialized' : 'null', 'callActive:', callActive);

    if (!vapiRef.current) {
      console.warn('endCall: VAPI instance is null, cannot end call.');
      persistentCallState.status = 'ended';
      persistentCallState.active = false;
      forceComponentRender();
      return;
    }

    console.log('endCall: Calling vapiRef.current.stop()...');
    try {
      vapiRef.current.stop();
      // Immediately update persistent state and force render, regardless of Vapi event firing
      persistentCallState.status = 'ended';
      persistentCallState.active = false;
      persistentCallState.startTime = null; // Stop the timer
      persistentCallState.duration = 0; // Reset duration
      persistentCallState.error = null; // Clear any previous errors
      forceComponentRender();
      console.log('endCall: VAPI: Call manually ended successfully. Persistent state updated.');
    } catch (err: any) {
      console.error('endCall: Error caught during VAPI call stop:', err);
      persistentCallState.error = 'Failed to end call: ' + (err?.message || JSON.stringify(err));
      persistentCallState.status = 'ended'; // Ensure status is ended even on error
      persistentCallState.active = false; // Ensure active is false on error
      forceComponentRender();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Trainer Card */}
        <div className="bg-zinc-800 p-6 md:p-8 rounded-xl shadow-2xl border border-zinc-700 flex flex-col items-center justify-between min-h-[400px]">
          <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Sales Trainer</h2>

          <div className="flex flex-col items-center justify-center flex-grow">
            {callStatus === 'connecting' && (
              <div className="flex flex-col items-center mb-4">
                <p className="text-purple-400 text-xl mb-2">Connecting...</p>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400"></div>
              </div>
            )}
            {callStatus === 'in-progress' && (
              <div className="flex flex-col items-center mb-4">
                <p className="text-green-500 text-xl mb-2 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                  </span>
                  Connected
                </p>
                <p className="text-zinc-400 text-md">Call Duration: {formatDuration(callDuration)}</p>
              </div>
            )}
            {error && (
              <p className="text-red-500 text-md text-center mt-2">Error: {error}</p>
            )}

            <button
              onClick={startCall}
              disabled={callActive || !persistentCallState.isVapiReady}
              className={`w-full max-w-xs mt-6 px-8 py-4 rounded-full text-xl font-bold transition-transform transform hover:scale-105
                ${callActive || !persistentCallState.isVapiReady
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-700 hover:bg-purple-800 text-white shadow-lg'}
              `}
            >
              {callStatus === 'connecting' ? 'Connecting...' : 'Start Sales Call'}
            </button>

            {callActive && (
              <button
                onClick={endCall}
                disabled={!callActive}
                className={`w-full max-w-xs mt-4 px-8 py-4 rounded-full text-xl font-bold transition-transform transform hover:scale-105
                  ${!callActive
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-red-700 hover:bg-red-800 text-white shadow-lg'}
                `}
              >
                End Call 📞
              </button>
            )}
          </div>

          <button
            onClick={onBack}
            className="mt-8 text-purple-400 hover:text-purple-300 transition-colors text-lg"
          >
            ← Back to Prospects
          </button>
        </div>

        {/* Transcription Card */}
        <div className="bg-zinc-800 p-6 md:p-8 rounded-xl shadow-2xl border border-zinc-700 flex flex-col min-h-[400px]">
          <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Transcription</h2>
          <div className="flex-grow overflow-y-auto custom-scrollbar p-2 -mx-2">
            {transcript.length > 0 ? (
              transcript.map((segment, index) => (
                <p key={index} className={`mb-3 py-2 px-4 rounded-lg text-lg leading-relaxed ${segment.speaker === 'me' ? 'bg-purple-800/30 text-purple-200 self-end text-right ml-auto' : 'bg-zinc-700/50 text-zinc-300 self-start text-left mr-auto'} max-w-[85%]`}>
                  <strong className="font-semibold block mb-1 text-base">{segment.speaker === 'me' ? 'Me:' : 'Agent:'}</strong> {segment.text}
                </p>
              ))
            ) : (
              <p className="text-center text-zinc-500 text-lg mt-10">Start a call to see transcription</p>
            )}
          </div>
          {callStatus === 'ended' && persistentCallState.score !== null && (
            <div className="mt-8 p-4 bg-zinc-700 rounded-lg">
              <div className="text-xl font-bold text-green-400 mb-3">Score: {persistentCallState.score}/100</div>
              <div className="text-zinc-300 whitespace-pre-wrap text-md">
                <h3 className="font-semibold text-white mb-2 text-lg">Feedback:</h3>
                {persistentCallState.feedback && typeof persistentCallState.feedback === 'object' ? (
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(persistentCallState.feedback).map(([key, value], index) => (
                      <li key={index}><strong>{key}:</strong> {String(value)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{String(persistentCallState.feedback)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 