import Groq from "groq-sdk";
import { NextResponse } from "next/server";

// .env.local dosyasındaki yeni Groq API anahtarımızı sisteme tanıtıyoruz
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Lütfen bir soru veya komut girin." },
        { status: 400 }
      );
    }

    // Groq'a soruyu ve MikroTik uzmanı kimliğini gönderiyoruz
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Sen profesyonel bir MikroTik RouterOS uzmanı ve ağ mühendisisin. 
          Sadece ağ yönetimi, RouterOS v6/v7 komutları, firewall, routing ve kablosuz ağlar hakkında teknik destek sağla. 
          Cevaplarında mutlaka terminale kopyalanıp yapıştırılabilecek kod blokları kullan. 
          Başka konularda soru gelirse alanının olmadığını kibarca belirt. Türkçe cevap ver.`
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      // Groq üzerindeki en yetenekli ve hızlı modellerden biri
      model: "llama3-70b-8192", 
      temperature: 0.5, // Daha net ve teknik cevaplar vermesi için
    });

    // Gelen cevabı alıyoruz
    const text = chatCompletion.choices[0]?.message?.content || "Cevap üretilemedi.";

    return NextResponse.json({ success: true, text: text });
  } catch (error) {
    console.error("Groq API Hatası:", error);
    return NextResponse.json(
      { success: false, error: "AI servisine ulaşılamıyor. Lütfen API anahtarınızı kontrol edin." },
      { status: 500 }
    );
  }
}