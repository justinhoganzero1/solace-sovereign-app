import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content_type, content_url, content_text, audio_url } = await req.json();

    let analysisPrompt = '';
    let fileUrls = [];

    if (content_type === 'video' || content_type === 'image') {
      fileUrls.push(content_url);
      analysisPrompt = `TRUTH LENS - ANTI-DEEPFAKE SHIELD

Analyze this ${content_type} for signs of AI manipulation, deepfakes, or deception:
- Visual inconsistencies
- Unnatural movements or expressions
- Audio-video sync issues
- Lighting/shadow anomalies
- AI generation artifacts

Provide a Digital Health Check with:
1. Authenticity score (0-100, where 100 = genuine)
2. Red flags detected (if any)
3. Confidence level
4. Recommendation (trust/caution/reject)

Format as JSON: {authenticity: number, red_flags: array, confidence: string, recommendation: string}`;
    } else if (content_type === 'audio' || content_type === 'call') {
      if (audio_url) fileUrls.push(audio_url);
      analysisPrompt = `TRUTH LENS - VOICE MANIPULATION DETECTOR

Analyze this audio for:
- Voice cloning/AI synthesis
- Emotional manipulation tactics
- Scam indicators (urgency, threats, requests for money)
- Background noise inconsistencies

Digital Health Check result as JSON: {authenticity: number, scam_indicators: array, confidence: string, recommendation: string}`;
    } else if (content_type === 'text') {
      analysisPrompt = `TRUTH LENS - TEXT AUTHENTICITY VALIDATOR

Analyze this message for deception:
"${content_text}"

Check for:
- Phishing patterns
- Social engineering tactics
- Urgency manipulation
- Grammar/spelling (bot indicators)
- Known scam phrases

Result as JSON: {authenticity: number, scam_patterns: array, confidence: string, recommendation: string}`;
    }

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      file_urls: fileUrls.length > 0 ? fileUrls : null,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          authenticity: { type: "number" },
          red_flags: { type: "array", items: { type: "string" } },
          scam_indicators: { type: "array", items: { type: "string" } },
          scam_patterns: { type: "array", items: { type: "string" } },
          confidence: { type: "string" },
          recommendation: { type: "string" }
        }
      }
    });

    // Determine overlay color based on authenticity
    let overlayColor = 'green';
    if (analysis.authenticity < 50) {
      overlayColor = 'red';
    } else if (analysis.authenticity < 75) {
      overlayColor = 'yellow';
    }

    const allFlags = [
      ...(analysis.red_flags || []),
      ...(analysis.scam_indicators || []),
      ...(analysis.scam_patterns || [])
    ];

    return Response.json({ 
      success: true,
      truth_lens_active: true,
      authenticity_score: analysis.authenticity,
      overlay_color: overlayColor,
      warnings: allFlags,
      confidence: analysis.confidence,
      oracle_recommendation: analysis.recommendation,
      shield_status: analysis.authenticity > 75 ? 'VERIFIED' : analysis.authenticity > 50 ? 'CAUTION' : 'THREAT DETECTED'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});