export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, category } = req.body;

    // Validate input
    if (!prompt || !category) {
      return res.status(400).json({ error: 'Prompt and category are required' });
    }

    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`  // Uses env variable
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: `Generate a ${category} quote about ${prompt}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const data = await deepseekResponse.json();
    const quote = data.choices[0].message.content;

    // Clean up the quote (remove quotes if present)
    const cleanQuote = quote.replace(/^["'](.*)["']$/, '$1');

    return res.status(200).json({ quote: cleanQuote });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to generate quote', details: error.message });
  }
}
