import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pet_name, pet_type, substance, description } = await req.json();

    // AI toxicity analysis
    const toxicityPrompt = `As a veterinary AI assistant, analyze if "${substance}" is toxic or dangerous for a ${pet_type} named ${pet_name}.
    
Additional context: ${description || 'None provided'}

Provide:
1. Toxicity level: SAFE, CAUTION, WARNING, or EMERGENCY
2. Detailed explanation of risks
3. Immediate actions to take
4. Whether to contact a vet

Be thorough but clear. If EMERGENCY, emphasize urgency.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: toxicityPrompt,
      add_context_from_internet: true  // Use internet for latest pet toxicity data
    });

    // Parse severity from response
    let severity = 'safe';
    let is_toxic = false;
    
    if (analysis.toLowerCase().includes('emergency')) {
      severity = 'emergency';
      is_toxic = true;
    } else if (analysis.toLowerCase().includes('warning')) {
      severity = 'warning';
      is_toxic = true;
    } else if (analysis.toLowerCase().includes('caution')) {
      severity = 'caution';
      is_toxic = false;
    }

    // Create health log entry
    const healthLog = await base44.entities.PetHealthLog.create({
      pet_name,
      pet_type,
      log_type: 'toxicity_check',
      description: `Checked: ${substance}. ${description || ''}`,
      toxicity_warning: analysis,
      is_toxic,
      severity,
      timestamp: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      analysis,
      severity,
      is_toxic,
      health_log: healthLog,
      emergency_contact: severity === 'emergency' ? 'CONTACT VET IMMEDIATELY' : null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});