import React, { useState } from "react";
import { sendPrompt } from "./api";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome! How can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Ready");

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setStatus("Generating...");
    setInput("");

    try {
      const res = await sendPrompt(input);
      setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
      setStatus("Ready");
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error generating response." }]);
      setStatus("Error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ollama AI Assistant</h1>
      <div className="border rounded p-2 h-96 overflow-y-scroll mb-2 bg-gray-100">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
            <div className={`inline-block p-2 rounded ${m.role === "user" ? "bg-blue-200" : "bg-green-200"}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full border p-2 mb-2"
        rows={3}
        placeholder="Type your message..."
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
      <div className="mt-2 text-sm text-gray-600">{status}</div>
    </div>
  );
}
