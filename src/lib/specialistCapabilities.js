const specialistProfiles = {
  'A-Grade Motor Mechanic': {
    mode: 'diagnostic_workbench',
    mission: 'Diagnose vehicle faults, create safe repair plans, and triage whether the user can proceed, needs a shop, or needs urgent roadside help.',
    requiredInputs: ['problem_description', 'vehicle_type', 'symptoms', 'camera'],
    deviceHooks: ['camera', 'microphone'],
    deliverables: ['fault summary', 'probable causes', 'repair steps', 'tools list', 'safety warnings'],
    promptStyle: 'mechanical_diagnostic'
  },
  'Diesel Engineering': {
    mode: 'diesel_diagnostic',
    mission: 'Analyze diesel engine symptoms, fuel and combustion issues, and generate engineering-grade inspection sequences.',
    requiredInputs: ['problem_description', 'engine_type', 'usage_context', 'camera'],
    deviceHooks: ['camera', 'microphone'],
    deliverables: ['diesel-specific fault tree', 'inspection plan', 'safety warnings'],
    promptStyle: 'diesel_engineering'
  },
  'Auto Electrical Engineer': {
    mode: 'electrical_diagnostic',
    mission: 'Trace electrical faults, battery or charging issues, and isolate wiring, fuse, and sensor problems.',
    requiredInputs: ['problem_description', 'symptoms', 'camera'],
    deviceHooks: ['camera'],
    deliverables: ['circuit checklist', 'test steps', 'repair priority'],
    promptStyle: 'electrical_systems'
  },
  'Builder': {
    mode: 'project_planner',
    mission: 'Turn real-world builds into scoped project plans with materials, phases, safety constraints, and execution order.',
    requiredInputs: ['project_goal', 'camera', 'measurements'],
    deviceHooks: ['camera'],
    deliverables: ['build plan', 'materials list', 'time estimate', 'risk notes'],
    promptStyle: 'construction_planner'
  },
  'Handyman': {
    mode: 'repair_triage',
    mission: 'Help users identify household repair issues, decide if they can DIY them, and produce safe step-by-step guidance.',
    requiredInputs: ['problem_description', 'camera'],
    deviceHooks: ['camera'],
    deliverables: ['repair decision', 'steps', 'tools list', 'hazard list'],
    promptStyle: 'home_repair'
  },
  'Live Vision': {
    mode: 'visual_assistant',
    mission: 'Use the camera to inspect surroundings, identify objects or risks, and provide context-aware guidance in real time.',
    requiredInputs: ['camera'],
    deviceHooks: ['camera', 'microphone', 'speechSynthesis'],
    deliverables: ['scene analysis', 'hazards', 'action suggestions'],
    promptStyle: 'live_vision'
  },
  'Fitness Coach': {
    mode: 'fitness_protocol',
    mission: 'Create adaptive training plans informed by goals, recovery, mobility limits, and wearable or sensor data when available.',
    requiredInputs: ['goals', 'fitness_level', 'constraints'],
    deviceHooks: ['wearableLikely', 'connection'],
    deliverables: ['training plan', 'recovery advice', 'progress metrics'],
    promptStyle: 'fitness_coach'
  },
  'Nutrition Expert': {
    mode: 'nutrition_protocol',
    mission: 'Generate nutrition plans based on body goals, health context, dietary preferences, and meal constraints.',
    requiredInputs: ['goal', 'diet_preferences', 'health_context'],
    deviceHooks: ['camera'],
    deliverables: ['meal strategy', 'food suggestions', 'shopping priorities'],
    promptStyle: 'nutrition_planner'
  },
  'Photographer': {
    mode: 'creative_review',
    mission: 'Review shots, diagnose composition and lighting problems, and propose capture or editing improvements.',
    requiredInputs: ['camera', 'creative_goal'],
    deviceHooks: ['camera', 'storage'],
    deliverables: ['shot critique', 'composition advice', 'reshoot plan'],
    promptStyle: 'photo_direction'
  },
  'UX Designer': {
    mode: 'ux_workbench',
    mission: 'Evaluate app or product flows, improve entry points, retention, hierarchy, accessibility, and conversion paths.',
    requiredInputs: ['product_goal', 'target_user', 'screen_context'],
    deviceHooks: ['camera', 'storage'],
    deliverables: ['ux critique', 'screen hierarchy', 'flow improvements'],
    promptStyle: 'ux_designer'
  },
  'App Developer': {
    mode: 'app_architect',
    mission: 'Design stronger app concepts, compare existing market patterns, and produce differentiated app blueprints.',
    requiredInputs: ['app_goal', 'target_market', 'feature_set'],
    deviceHooks: ['connection', 'storage'],
    deliverables: ['app concept', 'market angle', 'feature architecture', 'launch priorities'],
    promptStyle: 'app_architect'
  }
};

const categoryDefaults = {
  personal: {
    mode: 'guided_coach',
    mission: 'Provide structured guidance with checkpoints, reflection prompts, and practical next actions.',
    requiredInputs: ['goal_or_problem'],
    deviceHooks: ['microphone', 'speechSynthesis'],
    deliverables: ['assessment', 'plan', 'follow-up actions'],
    promptStyle: 'personal_specialist'
  },
  education: {
    mode: 'teaching_lab',
    mission: 'Teach with explanations, examples, practice, and progress checks instead of vague answers.',
    requiredInputs: ['topic', 'level'],
    deviceHooks: ['microphone', 'camera'],
    deliverables: ['explanation', 'practice plan', 'quiz prompts'],
    promptStyle: 'education_specialist'
  },
  health: {
    mode: 'wellness_console',
    mission: 'Support wellness planning, tracking, and habit changes while staying non-diagnostic and safety-conscious.',
    requiredInputs: ['goal_or_symptom_context'],
    deviceHooks: ['wearableLikely', 'camera'],
    deliverables: ['wellness plan', 'trackers', 'safety escalations'],
    promptStyle: 'health_specialist'
  },
  creative: {
    mode: 'creative_studio',
    mission: 'Act like a practical creative director with critiques, iterations, briefs, and production guidance.',
    requiredInputs: ['creative_goal'],
    deviceHooks: ['camera', 'microphone', 'storage'],
    deliverables: ['brief', 'critique', 'next iterations'],
    promptStyle: 'creative_specialist'
  },
  business: {
    mode: 'strategy_console',
    mission: 'Produce concrete business analysis, frameworks, and decision options rather than generic advice.',
    requiredInputs: ['business_goal'],
    deviceHooks: ['connection', 'storage'],
    deliverables: ['analysis', 'recommendations', 'execution steps'],
    promptStyle: 'business_specialist'
  },
  technology: {
    mode: 'technical_workbench',
    mission: 'Solve technical problems with structured troubleshooting, architecture, and implementation detail.',
    requiredInputs: ['technical_goal_or_issue'],
    deviceHooks: ['connection', 'storage', 'camera'],
    deliverables: ['diagnosis', 'implementation plan', 'tools'],
    promptStyle: 'technology_specialist'
  },
  entertainment: {
    mode: 'discovery_guide',
    mission: 'Guide discovery and participation with tailored recommendations, critiques, and participation plans.',
    requiredInputs: ['interest_or_context'],
    deviceHooks: ['microphone', 'camera'],
    deliverables: ['recommendations', 'playbook', 'activity suggestions'],
    promptStyle: 'entertainment_specialist'
  },
  lifestyle: {
    mode: 'life_ops_console',
    mission: 'Help users operate home and life systems with practical, outcome-driven steps.',
    requiredInputs: ['problem_or_goal'],
    deviceHooks: ['camera'],
    deliverables: ['action plan', 'supplies', 'warnings'],
    promptStyle: 'lifestyle_specialist'
  },
  mechanics: {
    mode: 'mechanical_workbench',
    mission: 'Troubleshoot physical systems using evidence, symptoms, images, and safe procedural thinking.',
    requiredInputs: ['problem_description', 'camera'],
    deviceHooks: ['camera', 'microphone'],
    deliverables: ['diagnostic tree', 'repair steps', 'safety notes'],
    promptStyle: 'mechanics_specialist'
  },
  travel: {
    mode: 'travel_planner',
    mission: 'Build useful trip plans with logistics, experience design, and constraints.',
    requiredInputs: ['destination_or_goal'],
    deviceHooks: ['geolocation', 'connection'],
    deliverables: ['itinerary', 'checklist', 'budget guidance'],
    promptStyle: 'travel_specialist'
  },
  family: {
    mode: 'family_support',
    mission: 'Provide structured family planning and support actions with age and context awareness.',
    requiredInputs: ['family_context'],
    deviceHooks: ['calendar', 'microphone'],
    deliverables: ['support plan', 'activities', 'conversation prompts'],
    promptStyle: 'family_specialist'
  }
};

export function getSpecialistProfile(specialist) {
  if (!specialist) return null;

  const directProfile = specialistProfiles[specialist.name];
  const categoryProfile = categoryDefaults[specialist.category] || {
    mode: 'general_specialist',
    mission: 'Provide structured specialist support with actionable outcomes.',
    requiredInputs: ['goal_or_problem'],
    deviceHooks: [],
    deliverables: ['assessment', 'recommendations'],
    promptStyle: 'general_specialist'
  };

  return {
    ...categoryProfile,
    ...directProfile,
    specialistName: specialist.name,
    emoji: specialist.emoji,
    category: specialist.category,
    shortDescription: specialist.description,
    color: specialist.color,
  };
}

export function buildSpecialistSystemPrompt(profile) {
  if (!profile) return 'You are a specialist assistant. Provide structured, actionable help.';

  return `You are SOLACE specialist mode for ${profile.specialistName}. Mission: ${profile.mission}

You must behave like a dedicated ${profile.specialistName} tool, not a generic assistant.

Required inputs to request when missing: ${profile.requiredInputs.join(', ')}.
Device capabilities you may rely on when available: ${profile.deviceHooks.join(', ') || 'none'}.
Primary deliverables: ${profile.deliverables.join(', ')}.

Always:
- ask clarifying questions when required inputs are missing
- produce practical outputs, not vague motivation
- structure responses into clear sections
- mention safety limitations when relevant
- stay within the job of this specialist mode`;
}
