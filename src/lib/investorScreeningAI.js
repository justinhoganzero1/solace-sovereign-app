/**
 * Investor Screening AI System
 * AI questionnaire and chatbot to screen investors
 * Protects owner email - only sends vetted inquiries
 */

export const OWNER_EMAIL = 'justinbretthogan@gmail.com';

export class InvestorScreeningAI {
  constructor() {
    this.screeningQuestions = this.initializeQuestions();
    this.conversationHistory = new Map();
    this.approvedInvestors = new Set();
  }

  initializeQuestions() {
    return [
      {
        id: 'investment_amount',
        question: 'What is your potential investment range?',
        type: 'select',
        options: [
          '$10,000 - $50,000',
          '$50,000 - $100,000',
          '$100,000 - $500,000',
          '$500,000 - $1,000,000',
          '$1,000,000+'
        ],
        required: true,
        weight: 10
      },
      {
        id: 'investment_timeline',
        question: 'What is your investment timeline?',
        type: 'select',
        options: [
          'Immediate (within 1 month)',
          'Short-term (1-3 months)',
          'Medium-term (3-6 months)',
          'Long-term (6+ months)',
          'Exploring opportunities'
        ],
        required: true,
        weight: 8
      },
      {
        id: 'investor_type',
        question: 'What type of investor are you?',
        type: 'select',
        options: [
          'Angel Investor',
          'Venture Capital',
          'Private Equity',
          'Strategic Corporate',
          'Individual/Family Office',
          'Other'
        ],
        required: true,
        weight: 9
      },
      {
        id: 'experience',
        question: 'How many tech startups have you invested in?',
        type: 'select',
        options: [
          'None - First investment',
          '1-3 companies',
          '4-10 companies',
          '10-25 companies',
          '25+ companies'
        ],
        required: true,
        weight: 7
      },
      {
        id: 'interest_area',
        question: 'What aspects of SOLACE interest you most?',
        type: 'multiselect',
        options: [
          'AI Technology',
          'Monetization Model',
          'Market Opportunity',
          'User Base Growth',
          'Product Innovation',
          'Revenue Potential',
          'Team & Vision'
        ],
        required: true,
        weight: 6
      },
      {
        id: 'company_name',
        question: 'What is your company/fund name?',
        type: 'text',
        required: true,
        weight: 5
      },
      {
        id: 'full_name',
        question: 'What is your full name?',
        type: 'text',
        required: true,
        weight: 5
      },
      {
        id: 'email',
        question: 'What is your email address?',
        type: 'email',
        required: true,
        weight: 5
      },
      {
        id: 'phone',
        question: 'What is your phone number? (optional)',
        type: 'tel',
        required: false,
        weight: 3
      },
      {
        id: 'linkedin',
        question: 'LinkedIn profile URL? (optional)',
        type: 'url',
        required: false,
        weight: 3
      },
      {
        id: 'additional_info',
        question: 'Tell us more about your investment thesis and why SOLACE?',
        type: 'textarea',
        required: true,
        weight: 10
      }
    ];
  }

  async startScreening(sessionId) {
    // Initialize screening session
    const session = {
      id: sessionId,
      startedAt: new Date().toISOString(),
      answers: {},
      score: 0,
      status: 'in_progress',
      currentQuestion: 0
    };

    this.conversationHistory.set(sessionId, session);
    return session;
  }

  async submitAnswer(sessionId, questionId, answer) {
    const session = this.conversationHistory.get(sessionId);
    
    if (!session) {
      throw new Error('Invalid session');
    }

    // Store answer
    session.answers[questionId] = answer;

    // Calculate score
    const question = this.screeningQuestions.find(q => q.id === questionId);
    if (question) {
      session.score += this.scoreAnswer(question, answer);
    }

    // Move to next question
    session.currentQuestion++;

    // Check if screening complete
    if (session.currentQuestion >= this.screeningQuestions.length) {
      session.status = 'completed';
      session.completedAt = new Date().toISOString();
      
      // Evaluate if investor should be approved
      const evaluation = await this.evaluateInvestor(session);
      session.evaluation = evaluation;

      if (evaluation.approved) {
        await this.approveInvestor(session);
      }
    }

    return session;
  }

  scoreAnswer(question, answer) {
    let score = 0;

    // Score based on question type and answer
    switch (question.id) {
      case 'investment_amount':
        const amountScores = {
          '$10,000 - $50,000': 3,
          '$50,000 - $100,000': 5,
          '$100,000 - $500,000': 7,
          '$500,000 - $1,000,000': 9,
          '$1,000,000+': 10
        };
        score = (amountScores[answer] || 0) * question.weight;
        break;

      case 'investment_timeline':
        const timelineScores = {
          'Immediate (within 1 month)': 10,
          'Short-term (1-3 months)': 8,
          'Medium-term (3-6 months)': 6,
          'Long-term (6+ months)': 4,
          'Exploring opportunities': 2
        };
        score = (timelineScores[answer] || 0) * question.weight;
        break;

      case 'investor_type':
        const typeScores = {
          'Angel Investor': 8,
          'Venture Capital': 10,
          'Private Equity': 9,
          'Strategic Corporate': 9,
          'Individual/Family Office': 7,
          'Other': 5
        };
        score = (typeScores[answer] || 0) * question.weight;
        break;

      case 'experience':
        const expScores = {
          'None - First investment': 3,
          '1-3 companies': 5,
          '4-10 companies': 7,
          '10-25 companies': 9,
          '25+ companies': 10
        };
        score = (expScores[answer] || 0) * question.weight;
        break;

      case 'additional_info':
        // Score based on length and quality
        const wordCount = answer.split(' ').length;
        if (wordCount > 100) score = 10 * question.weight;
        else if (wordCount > 50) score = 7 * question.weight;
        else if (wordCount > 20) score = 5 * question.weight;
        else score = 3 * question.weight;
        break;

      default:
        // Default scoring for other questions
        if (answer && answer.length > 0) {
          score = 5 * question.weight;
        }
    }

    return score;
  }

  async evaluateInvestor(session) {
    const maxScore = this.screeningQuestions.reduce((sum, q) => sum + (q.weight * 10), 0);
    const percentage = (session.score / maxScore) * 100;

    // AI evaluation using LLM
    const aiEvaluation = await this.aiEvaluateInvestor(session);

    return {
      score: session.score,
      maxScore,
      percentage: percentage.toFixed(1),
      approved: percentage >= 60 && aiEvaluation.approved,
      tier: this.getInvestorTier(percentage),
      aiInsights: aiEvaluation.insights,
      recommendation: aiEvaluation.recommendation
    };
  }

  async aiEvaluateInvestor(session) {
    // Use AI to evaluate investor quality
    try {
      const prompt = `Evaluate this investor application for SOLACE, an AI-powered super app platform.

Investment Amount: ${session.answers.investment_amount}
Timeline: ${session.answers.investment_timeline}
Investor Type: ${session.answers.investor_type}
Experience: ${session.answers.experience}
Company: ${session.answers.company_name}
Additional Info: ${session.answers.additional_info}

Evaluate:
1. Seriousness of the investor
2. Fit with SOLACE's vision
3. Potential value beyond capital
4. Red flags or concerns

Respond with JSON:
{
  "approved": true/false,
  "insights": "key insights about this investor",
  "recommendation": "recommendation for founder",
  "concerns": ["any concerns"]
}`;

      // Simulate AI response (in production, use actual LLM)
      const response = {
        approved: session.score > 400,
        insights: 'Serious investor with relevant experience in tech startups',
        recommendation: 'Schedule initial call to discuss investment terms',
        concerns: []
      };

      return response;

    } catch (error) {
      console.error('AI evaluation failed:', error);
      return {
        approved: false,
        insights: 'Unable to complete AI evaluation',
        recommendation: 'Manual review required',
        concerns: ['AI evaluation failed']
      };
    }
  }

  getInvestorTier(percentage) {
    if (percentage >= 90) return 'Premium';
    if (percentage >= 75) return 'High Quality';
    if (percentage >= 60) return 'Qualified';
    if (percentage >= 40) return 'Potential';
    return 'Not Qualified';
  }

  async approveInvestor(session) {
    // Approve investor and send email to owner
    this.approvedInvestors.add(session.id);

    // Send email to owner with investor details
    await this.sendInvestorEmailToOwner(session);

    // Grant free trial access
    await this.grantFreeTrialAccess(session.answers.email);

    return true;
  }

  async sendInvestorEmailToOwner(session) {
    // Send email to owner with investor details
    const emailContent = this.generateInvestorEmail(session);

    try {
      // In production, use email service
      console.log('Sending email to owner:', OWNER_EMAIL);
      console.log('Email content:', emailContent);

      // Store in database for owner to review
      await gitStorage.create('investor_applications', {
        session_id: session.id,
        investor_email: session.answers.email,
        investor_name: session.answers.full_name,
        company: session.answers.company_name,
        investment_amount: session.answers.investment_amount,
        score: session.score,
        evaluation: session.evaluation,
        answers: session.answers,
        status: 'approved',
        email_sent_to_owner: true,
        sent_at: new Date().toISOString()
      });

      return { success: true };

    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  generateInvestorEmail(session) {
    return `
New Qualified Investor Application - SOLACE

INVESTOR DETAILS:
Name: ${session.answers.full_name}
Company: ${session.answers.company_name}
Email: ${session.answers.email}
Phone: ${session.answers.phone || 'Not provided'}
LinkedIn: ${session.answers.linkedin || 'Not provided'}

INVESTMENT PROFILE:
Amount: ${session.answers.investment_amount}
Timeline: ${session.answers.investment_timeline}
Type: ${session.answers.investor_type}
Experience: ${session.answers.experience}
Interest Areas: ${session.answers.interest_area?.join(', ') || 'Not specified'}

SCREENING RESULTS:
Score: ${session.score}/${session.evaluation.maxScore} (${session.evaluation.percentage}%)
Tier: ${session.evaluation.tier}
AI Recommendation: ${session.evaluation.recommendation}

INVESTOR'S MESSAGE:
${session.answers.additional_info}

AI INSIGHTS:
${session.evaluation.aiInsights}

---
This investor has been granted free trial access to SOLACE.
Reply to this email to connect with the investor.
    `;
  }

  async grantFreeTrialAccess(email) {
    // Grant free trial access to investor
    try {
      await gitStorage.create('users', {
        email,
        role: 'trial',
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
        source: 'investor_screening',
        granted_by: 'system'
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to grant trial access:', error);
      return { success: false, error: error.message };
    }
  }

  async chatWithInvestor(sessionId, message) {
    // AI chatbot to answer investor questions
    const session = this.conversationHistory.get(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        messages: [],
        startedAt: new Date().toISOString()
      };
      this.conversationHistory.set(sessionId, session);
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Generate AI response
    const aiResponse = await this.generateAIResponse(session.messages);

    // Add AI message
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });

    return aiResponse;
  }

  async generateAIResponse(messages) {
    // AI chatbot responses for investor questions
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // Predefined responses for common questions
    if (lastMessage.includes('revenue') || lastMessage.includes('monetization')) {
      return `SOLACE has multiple revenue streams:
- Subscription tiers: $15-$200/month
- Voice simulator: $5-$20 one-time fees
- Movie generation: $3/minute
- Bolt-on apps: 5% transaction fee

Our monetization model is designed for scalability with both recurring and one-time revenue.`;
    }

    if (lastMessage.includes('users') || lastMessage.includes('market')) {
      return `SOLACE targets multiple markets:
- Individual creators and developers
- Small businesses needing custom apps
- Content creators for AI movies and voices
- Enterprise customers for white-label solutions

Our super app architecture allows users to create apps inside the app, expanding our market reach exponentially.`;
    }

    if (lastMessage.includes('technology') || lastMessage.includes('ai')) {
      return `SOLACE leverages cutting-edge AI technology:
- Autonomous app maker (generates Play Store ready apps)
- AI movie maker with 8K avatars
- 200 multilingual voices
- Self-diagnosing AI for instant repairs
- Customer service AI
- Voice interaction via earbuds

All powered by advanced LLMs and custom AI systems.`;
    }

    if (lastMessage.includes('competition') || lastMessage.includes('competitors')) {
      return `SOLACE differentiates through:
- Super app architecture (build apps inside the app)
- Comprehensive monetization (multiple revenue streams)
- Offline capabilities with failsafe systems
- Voice interaction and earbud communication
- Self-healing technology
- No-code app generation

We're not just an app builder - we're a complete AI-powered ecosystem.`;
    }

    if (lastMessage.includes('investment') || lastMessage.includes('terms')) {
      return `Investment opportunities are evaluated on a case-by-case basis. After completing the screening questionnaire, qualified investors receive:
- Free trial access to SOLACE
- Direct communication with the founder
- Detailed pitch deck and financials
- Discussion of investment terms

Please complete the questionnaire to proceed.`;
    }

    // Default AI response
    return `Thank you for your question about SOLACE. Our AI-powered super app platform offers:
- Multiple revenue streams ($15-$200/month subscriptions + one-time fees)
- Advanced AI technology (autonomous app maker, movie generator, voice synthesis)
- Unique super app architecture
- Strong monetization model with 5% transaction fees on bolt-on apps

To learn more and discuss investment opportunities, please complete our investor questionnaire. Qualified investors receive free trial access and direct contact with our founder.

What specific aspect of SOLACE would you like to know more about?`;
  }

  getScreeningProgress(sessionId) {
    const session = this.conversationHistory.get(sessionId);
    
    if (!session) return null;

    return {
      currentQuestion: session.currentQuestion,
      totalQuestions: this.screeningQuestions.length,
      progress: ((session.currentQuestion / this.screeningQuestions.length) * 100).toFixed(0),
      status: session.status,
      score: session.score
    };
  }
}

export const investorScreeningAI = new InvestorScreeningAI();
