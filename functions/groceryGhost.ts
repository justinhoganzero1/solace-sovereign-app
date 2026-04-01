import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all grocery items not purchased
    const items = await base44.entities.GroceryItem.filter({ is_purchased: false });

    // Analyze and send smart reminders
    const highPriorityItems = items.filter(item => 
      item.priority === 'high' && !item.smart_reminder_sent
    );

    const reminders = [];
    
    for (const item of highPriorityItems) {
      // Generate smart reminder using AI
      const reminderText = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a friendly, helpful reminder about buying ${item.item_name} (${item.quantity}). 
        Make it conversational and helpful, mentioning why this item might be important. Keep it brief.`,
        add_context_from_internet: false
      });

      reminders.push({
        item: item.item_name,
        reminder: reminderText
      });

      // Mark reminder as sent
      await base44.entities.GroceryItem.update(item.id, {
        smart_reminder_sent: true
      });
    }

    // Auto-reorder suggestions
    const autoReorderItems = items.filter(item => item.auto_reorder);

    return Response.json({ 
      success: true,
      reminders,
      auto_reorder_suggestions: autoReorderItems,
      total_items: items.length,
      high_priority_count: highPriorityItems.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});