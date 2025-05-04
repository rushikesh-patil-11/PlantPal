export async function getAIRecommendation({
  plantName,
  plantSpecies,
  careIssue,
  plantDescription
}: {
  plantName: string;
  plantSpecies?: string;
  careIssue?: string;
  plantDescription?: string;
}) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY environment variable is not set");
  }

  let prompt = `I need specific plant care advice for my ${plantName}`;
  if (plantSpecies) {
    prompt += ` (${plantSpecies})`;
  }
  
  if (careIssue) {
    prompt += `. Issue: ${careIssue}`;
  }
  
  if (plantDescription) {
    prompt += `. Additional details: ${plantDescription}`;
  }
  
  prompt += `. Please provide specific, actionable advice about watering, light, soil, and common issues. Format your response as a comprehensive care guide with clear, practical recommendations. Include any seasonal adjustments if relevant.`;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a plant care expert with deep knowledge of houseplants. Provide specific, actionable advice about plant care. Be precise and focus on practical recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract tags from the response
    const content = data.choices[0].message.content;
    const tags = extractTags(content);
    
    return {
      content,
      tags
    };
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw error;
  }
}

// Helper function to extract meaningful tags from the AI response
function extractTags(content: string): string[] {
  const commonTags = [
    "watering", "light", "humidity", "fertilizing", "soil", 
    "temperature", "pests", "diseases", "propagation", "pruning", 
    "repotting", "leaf health", "root health", "seasonal care"
  ];
  
  const foundTags = commonTags.filter(tag => 
    content.toLowerCase().includes(tag.toLowerCase())
  );
  
  // Limit to top 5 tags
  return foundTags.slice(0, 5);
}
