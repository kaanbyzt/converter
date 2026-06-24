"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.text);
      } else {
        setResponse("Hata: " + data.error);
      }
    } catch (error) {
      setResponse("Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col items-center">
      <div className="text-center max-w-3xl mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">AI Asistan</h1>
        <p className="text-gray-400">MikroTik ile ilgili sorularınızı sorun, anında komut ve çözüm önerileri alın.</p>
      </div>

      <div className="w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Örn: Winbox portunu nasıl değiştiririm?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? "Düşünüyor..." : "Sor"}
          </button>
        </form>
      </div>

      {response && (
        <div className="w-full max-w-3xl mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-blue-400 font-semibold mb-4">Yanıt:</h2>
          <div className="text-gray-200 leading-relaxed">
            {/* Markdown çevirici bölümümüz */}
            <ReactMarkdown
              components={{
                pre: ({ node, ...props }) => (
                  <pre className="bg-black p-4 rounded-lg my-4 overflow-x-auto border border-gray-700 text-green-400 font-mono text-sm" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-gray-700 px-1 py-0.5 rounded text-blue-300" {...props} />
                )
              }}
            >
              {response}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}