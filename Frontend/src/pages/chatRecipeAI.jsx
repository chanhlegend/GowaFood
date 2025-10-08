import { useEffect, useRef, useState } from "react"
import Groq from "groq-sdk"

const AIFoodSuggestion = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! Mình là Gowa. Hãy nói cho mình biết nguyên liệu, khẩu vị hay mục tiêu dinh dưỡng của bạn để mình gợi ý bữa ăn nhé.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const scrollRef = useRef(null)

  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading])

  const sendMessage = async (e) => {
    e?.preventDefault()
    setError("")
    const trimmed = input.trim()
    if (!trimmed) return
    const nextMessages = [...messages, { role: "user", content: trimmed }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content:
              "Bạn là Cookbot, trợ lý ẩm thực nói tiếng Việt. Bạn gợi ý thực đơn, công thức, khẩu phần và mẹo nấu nướng theo nguyên liệu sẵn có, sở thích, bệnh lý hoặc mục tiêu (giảm cân, tăng cơ...). Luôn ngắn gọn, có cấu trúc (tiêu đề, nguyên liệu, các bước), kèm ước lượng calories và macro khi phù hợp. Tránh dùng nguyên liệu khó tìm trừ khi người dùng yêu cầu.",
          },
          ...nextMessages,
        ],
      })

      const answer = completion?.choices?.[0]?.message?.content?.trim() ||
        "Xin lỗi, hiện mình chưa có câu trả lời. Hãy thử hỏi lại nhé."
      setMessages((prev) => [...prev, { role: "assistant", content: answer }])
    } catch (err) {
      console.error(err)
      setError("Không thể kết nối Groq. Vui lòng kiểm tra VITE_GROQ_API_KEY và thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl mx-auto h-[80vh] sm:h-[85vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gowa - Trợ lý nấu ăn </h1>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`${
                  m.role === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"
                } max-w-[85%] sm:max-w-[75%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl whitespace-pre-wrap leading-relaxed`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-600 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl">
                Đang soạn câu trả lời...
              </div>
            </div>
          )}

          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-2 sm:p-3 border-t border-gray-200">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập nguyên liệu, mục tiêu hoặc món bạn muốn..."
              className="flex-1 resize-none h-12 sm:h-14 max-h-40 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base"
              style={{ '--tw-ring-color': '#228B22' }}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #228B22')}
              onBlur={(e) => (e.target.style.boxShadow = '')}
            />
            <button
              type="submit"
              disabled={loading}
              className="h-10 sm:h-12 px-4 sm:px-5 text-white font-medium rounded-xl shadow-md text-sm sm:text-base disabled:opacity-70"
              style={{ backgroundColor: '#228B22' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#1E7B1E')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#228B22')}
            >
              Gửi
            </button>
          </div>
          <div className="px-1 pt-2 text-[11px] sm:text-xs text-gray-500">
            Mẹo: Hãy mô tả rõ ràng số người ăn, khẩu vị, bếp/thiết bị, thời gian.
          </div>
        </form>
      </div>
    </div>
  )
}

export default AIFoodSuggestion
