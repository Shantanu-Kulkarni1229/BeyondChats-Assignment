import OpenAI from 'openai';


let groqClient = null;

const initializeGroq = () => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not found in environment variables');
  }
  
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
    
    console.log('✅ Groq AI initialized');
  }
  
  return groqClient;
};

export const enhanceArticle = async (originalArticle, referenceArticles) => {
  try {
    console.log('🤖 Enhancing article with Groq AI...');
    
    const groq = initializeGroq();
    
    // Prepare the prompt
    const prompt = buildEnhancementPrompt(originalArticle, referenceArticles);
    
    console.log('📝 Sending request to Groq AI...');
    
    // Generate content with Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Fast and capable model
      messages: [
        {
          role: "system",
          content: "You are a professional content writer and SEO expert."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 8192,
      top_p: 0.95,
    });
    
    const enhancedContent = response.choices[0].message.content;
    console.log(`✅ Groq generated ${enhancedContent.length} characters of enhanced content`);
    
    // Parse the enhanced content
    const parsedContent = parseEnhancedContent(enhancedContent, originalArticle, referenceArticles);
    
    // Add metadata about which AI was used
    parsedContent.aiProvider = 'Groq AI';
    
    return parsedContent;

  } catch (error) {
    console.error('❌ Error enhancing article with Groq:', error.message);
    
    if (error.message.includes('API_KEY') || error.message.includes('401')) {
      throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY in .env');
    }
    
    if (error.message.includes('quota') || error.message.includes('429')) {
      throw new Error('Groq API quota exceeded. Please try again later.');
    }
    
    if (error.message.includes('safety')) {
      throw new Error('Content was blocked by safety filters. Please try different content.');
    }
    
    throw new Error(`Failed to enhance article: ${error.message}`);
  }
};


const buildEnhancementPrompt = (original, references) => {
  const ref1 = references[0] || {};
  const ref2 = references[1] || {};
  
  return `You are a professional content writer and SEO expert. Your task is to rewrite and enhance an article to match the style, formatting, and quality of top-ranking articles on Google.

**ORIGINAL ARTICLE:**
Title: ${original.title}
Content: ${original.content}

**REFERENCE ARTICLE 1 (Top Ranking on Google):**
Title: ${ref1.title || 'N/A'}
URL: ${ref1.url || 'N/A'}
Content Preview: ${ref1.content ? ref1.content.substring(0, 2000) : 'N/A'}...

**REFERENCE ARTICLE 2 (Second Top Ranking on Google):**
Title: ${ref2.title || 'N/A'}
URL: ${ref2.url || 'N/A'}
Content Preview: ${ref2.content ? ref2.content.substring(0, 2000) : 'N/A'}...

**YOUR TASK:**
1. Analyze the writing style, tone, and structure of the two reference articles
2. Rewrite the original article to match their style and formatting
3. Enhance the content quality while maintaining the core message
4. Improve readability, SEO optimization, and engagement
5. Use similar heading structures and content organization
6. Match the length and depth of the reference articles
7. Keep the same professional tone and expertise level

**REQUIREMENTS:**
- Keep the enhanced content between 800-2000 words
- Use clear headings (use ## for main headings, ### for subheadings)
- Include an engaging introduction
- Use bullet points or numbered lists where appropriate
- Add a conclusion section
- Maintain factual accuracy
- Make it more comprehensive than the original
- Use markdown formatting

**OUTPUT FORMAT:**
Return ONLY the enhanced article content in markdown format. Do not include any meta-commentary, explanations, or notes. Start directly with the article title as an H1 heading (# Title), followed by the content.

Begin your response now:`;
};

/**
 * Parse and structure the enhanced content from AI
 * @param {string} enhancedText - Raw enhanced content from AI
 * @param {Object} original - Original article
 * @param {Array} references - Reference articles
 * @returns {Object} Structured enhanced article
 */
const parseEnhancedContent = (enhancedText, original, references) => {
  try {
    // Extract title from the enhanced content
    let title = original.title;
    let content = enhancedText.trim();
    
    // If content starts with # heading, extract it as title
    const titleMatch = content.match(/^#\s+(.+?)[\n\r]/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      content = content.replace(titleMatch[0], '').trim();
    }
    
    // Add references section at the end
    const referencesSection = buildReferencesSection(references);
    content = content + '\n\n' + referencesSection;
    
    // Calculate metrics
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    
    return {
      title,
      content,
      originalTitle: original.title,
      enhancedAt: new Date(),
      wordCount,
      readingTime: `${readingTime} min read`,
      references: references.map(ref => ({
        title: ref.title,
        url: ref.url,
        source: ref.displayLink || new URL(ref.url).hostname
      }))
    };

  } catch (error) {
    console.error('Error parsing enhanced content:', error.message);
    throw new Error(`Failed to parse enhanced content: ${error.message}`);
  }
};

/**
 * Build references/citations section
 * @param {Array} references - Reference articles
 * @returns {string} Formatted references section
 */
const buildReferencesSection = (references) => {
  if (!references || references.length === 0) {
    return '';
  }
  
  let referencesText = '\n\n---\n\n## References\n\n';
  referencesText += '*This article was enhanced based on top-ranking content from Google Search. Below are the reference sources:*\n\n';
  
  references.forEach((ref, index) => {
    const source = ref.displayLink || (ref.url ? new URL(ref.url).hostname : 'Unknown');
    referencesText += `${index + 1}. **[${ref.title}](${ref.url})** - ${source}\n`;
    if (ref.snippet) {
      referencesText += `   - ${ref.snippet}\n`;
    }
    referencesText += '\n';
  });
  
  return referencesText;
};

/**
 * Generate article summary using Groq AI
 * @param {string} content - Article content
 * @returns {Promise<string>} Article summary
 */
export const generateSummary = async (content) => {
  try {
    const groq = initializeGroq();
    
    const prompt = `Please provide a concise summary (2-3 sentences) of the following article:

${content.substring(0, 3000)}

Summary:`;
    
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const summary = response.choices[0].message.content.trim();
    return summary;

  } catch (error) {
    console.error('Error generating summary:', error.message);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};

/**
 * Generate SEO metadata using Groq AI
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {Promise<Object>} SEO metadata
 */
export const generateSEOMetadata = async (title, content) => {
  try {
    const groq = initializeGroq();
    
    const prompt = `Based on the following article, generate SEO metadata:

Title: ${title}
Content: ${content.substring(0, 2000)}

Please provide:
1. Meta description (150-160 characters)
2. 5-7 relevant keywords/tags (comma-separated)
3. Suggested URL slug

Format your response as JSON:
{
  "metaDescription": "...",
  "keywords": "...",
  "slug": "..."
}`;
    
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an SEO expert." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const metadata = JSON.parse(response.choices[0].message.content);
    return metadata;

  } catch (error) {
    console.error('Error generating SEO metadata:', error.message);
    return {
      metaDescription: '',
      keywords: '',
      slug: ''
    };
  }
};

/**
 * Check content quality using Groq AI
 * @param {string} content - Content to check
 * @returns {Promise<Object>} Quality assessment
 */
export const assessContentQuality = async (content) => {
  try {
    const groq = initializeGroq();
    
    const prompt = `Analyze the quality of this content and provide scores (1-10) for:
1. Readability
2. SEO optimization
3. Engagement
4. Structure
5. Overall quality

Content:
${content.substring(0, 2000)}

Provide scores and brief explanations in JSON format:
{
  "readability": {"score": 0, "note": ""},
  "seo": {"score": 0, "note": ""},
  "engagement": {"score": 0, "note": ""},
  "structure": {"score": 0, "note": ""},
  "overall": {"score": 0, "note": ""}
}`;
    
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a content quality analyst." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const assessment = JSON.parse(response.choices[0].message.content);
    return assessment;

  } catch (error) {
    console.error('Error assessing content quality:', error.message);
    return null;
  }
};

export default enhanceArticle;
