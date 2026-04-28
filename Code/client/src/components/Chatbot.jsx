import { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chatbot = ({ isOpen, onClose }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      text: "Hi! I'm your AI Career Mentor. Ask me anything about your domain, building a portfolio, or getting clients on freelancing platforms!",
      sender: "bot",
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isOpen]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { text: chatInput, sender: "user" };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://127.0.0.1:8000/api/chat/",
        { message: userMsg.text },
        { headers: { Authorization: `Token ${token}` } },
      );

      setChatMessages((prev) => [
        ...prev,
        { text: res.data.reply, sender: "bot" },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I am having trouble connecting to the server.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // If the chat isn't open, don't render anything
  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
      style={{ height: "500px", maxHeight: "80vh" }}
    >
      {/* Chat Header */}
      <div className="bg-sky-600 text-white p-4 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <span className="text-xl">✦</span> AI Mentor
        </h3>
        <button
          onClick={onClose}
          className="text-white hover:text-sky-200 text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[85%] text-sm shadow-sm ${msg.sender === "user" ? "bg-sky-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-slate-700 rounded-bl-none"}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-white border border-gray-200 text-slate-500 text-sm rounded-bl-none italic">
              Typing...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask for career advice..."
          className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          disabled={isChatLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isChatLoading || !chatInput.trim()}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 disabled:bg-sky-300 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
