"use client"

import { useState } from "react"

export default function Home() {
  const [text, setText] = useState("Hello World")

  return (
      <main style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h1>{text}</h1>
        <button onClick={() => setText(text === "Hello World :)" ? "Hello Next.js" : "Hello World")}>
          Click me
        </button>
      </main>
  )
}
