import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { xp_amount, reason } = await req.json();

    // Get or create empire level
    let empireLevel = await base44.entities.EmpireLevel.filter({ created_by: user.email });
    if (empireLevel.length === 0) {
      empireLevel = [await base44.entities.EmpireLevel.create({
        level: 1,
        xp: 0,
        xp_to_next_level: 100
      })];
    }

    const current = empireLevel[0];
    const newXP = current.xp + xp_amount;
    let newLevel = current.level;
    let xpToNext = current.xp_to_next_level;

    // Level up logic
    const leveledUp = [];
    let remainingXP = newXP;
    while (remainingXP >= xpToNext) {
      remainingXP -= xpToNext;
      newLevel++;
      xpToNext = Math.floor(100 * Math.pow(1.5, newLevel - 1)); // Exponential scaling
      leveledUp.push(newLevel);
    }

    // Rank titles based on level
    const rankTitles = {
      1: 'Initiate',
      5: 'Apprentice',
      10: 'Adept',
      20: 'Expert',
      30: 'Master',
      40: 'Grandmaster',
      50: 'Legend',
      75: 'Titan',
      100: 'Oracle'
    };
    
    let rankTitle = 'Initiate';
    for (const [level, title] of Object.entries(rankTitles).reverse()) {
      if (newLevel >= parseInt(level)) {
        rankTitle = title;
        break;
      }
    }

    await base44.entities.EmpireLevel.update(current.id, {
      level: newLevel,
      xp: remainingXP,
      xp_to_next_level: xpToNext,
      rank_title: rankTitle
    });

    // Award badges for level milestones
    const badges = [];
    if (leveledUp.includes(10)) {
      await base44.entities.Badge.create({
        badge_name: 'Rising Star',
        badge_type: 'explorer',
        icon: '⭐',
        description: 'Reached level 10',
        rarity: 'common'
      });
      badges.push('Rising Star');
    }
    if (leveledUp.includes(25)) {
      await base44.entities.Badge.create({
        badge_name: 'Elite Member',
        badge_type: 'elite',
        icon: '💎',
        description: 'Reached level 25',
        rarity: 'rare'
      });
      badges.push('Elite Member');
    }
    if (leveledUp.includes(50)) {
      await base44.entities.Badge.create({
        badge_name: 'Legendary Oracle',
        badge_type: 'legend',
        icon: '👑',
        description: 'Reached level 50',
        rarity: 'legendary'
      });
      badges.push('Legendary Oracle');
    }

    return Response.json({
      success: true,
      leveled_up: leveledUp.length > 0,
      new_level: newLevel,
      new_xp: remainingXP,
      xp_to_next: xpToNext,
      rank_title: rankTitle,
      badges_earned: badges,
      reason
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});