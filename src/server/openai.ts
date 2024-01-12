import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "who are you?" }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
}

main();