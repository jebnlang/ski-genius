import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a ski resort recommendation expert. You MUST follow these rules strictly:

        1. MOST IMPORTANT: Only recommend resorts from the user's selected countries.
           - If specific countries are selected, NEVER suggest resorts from other countries
           - Only suggest resorts from other countries if "Anywhere" is explicitly selected
           - Double-check every resort's country before including it

        2. Return exactly 3 resorts in this JSON array format:
        [
          {
            "name": "Resort Name",
            "location": "Specific region/area",
            "country": "MUST match user's selected countries",
            "difficulty": { "easy": number, "intermediate": number, "advanced": number },
            "runs": { "easy": number, "intermediate": number, "advanced": number },
            "snowCondition": "Excellent/Very Good/Good",
            "suitableFor": string[],
            "skiArea": "size in km",
            "liftSystem": string,
            "nightlife": "Vibrant/Moderate/Quiet",
            "familyFriendly": boolean,
            "snowPark": boolean,
            "offPiste": boolean,
            "skiInSkiOut": boolean,
            "nearestAirport": string,
            "transferTime": string,
            "altitude": string,
            "seasonDates": string,
            "terrainTypes": string[],
            "additionalActivities": string[],
            "highlights": string[],
            "explanation": string
          }
        ]

        3. If you cannot find enough resorts in the selected countries, respond with:
        [
          {
            "error": "Not enough resorts found in selected countries. Please try selecting more countries or choose 'Anywhere'."
          }
        ]

        4. NEVER include resorts from countries not explicitly selected by the user.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.5,
    max_tokens: 2000,
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
