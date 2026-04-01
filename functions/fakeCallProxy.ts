import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenario = 'default' } = await req.json();

    const scenarios = {
      default: {
        caller: "Emergency Contact",
        message: "I need you home right now. It's urgent. Can you leave?"
      },
      work: {
        caller: "Boss",
        message: "We have a critical situation at the office. I need you here immediately."
      },
      family: {
        caller: "Mom",
        message: "Your father is in the hospital. You need to come right away."
      },
      friend: {
        caller: "Best Friend",
        message: "I'm outside. We need to go, it's important. Come out now."
      },
      pet: {
        caller: "Home Security",
        message: "Alert: Your pet is in distress. Water leak detected. Return home immediately."
      }
    };

    const selectedScenario = scenarios[scenario] || scenarios.default;

    // Generate voice message
    const voiceMessage = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a realistic, urgent phone call script. Caller: ${selectedScenario.caller}. Message: ${selectedScenario.message}. Make it sound natural and convincing for someone who needs to leave a situation quickly.`
    });

    return Response.json({
      success: true,
      scenario: selectedScenario,
      callScript: voiceMessage,
      voiceEnabled: true,
      instruction: "Show incoming call screen with caller name. Play voice message when answered."
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});