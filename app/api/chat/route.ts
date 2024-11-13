import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const response = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You are a ski resort recommendation expert. Provide detailed, accurate resort information in valid JSON format. Be concise and focused.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 0.8
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get resort recommendations' }), 
      { status: 500 }
    )
  }
}
