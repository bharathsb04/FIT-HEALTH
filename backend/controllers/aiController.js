const db = require('../data/dbStorage');

exports.askAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a fitness question or topic.' });
    }

    const q = question.toLowerCase();
    const user = db.findById('users', req.userId);
    const today = new Date().toISOString().split('T')[0];
    const dietLog = db.findOne('dietPlans', d => d.userId === req.userId && d.date === today);
    const vitals = db.findOne('vitalsLogs', v => v.userId === req.userId && v.date === today);

    const goal = user?.primaryGoal || 'Bulking';
    const weight = user?.weight || 75;
    const targetCalories = user?.targetCalories || 2800;
    const targetProtein = user?.targetProtein || 160;

    let consumedProtein = 0;
    if (dietLog && dietLog.meals) {
      consumedProtein = dietLog.meals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
    }

    const sleepHours = vitals?.sleepHours || 7.5;
    const recoveryScore = vitals?.recoveryScore || 85;

    let answer = '';
    let category = 'General Fitness';
    let suggestedFollowUps = [];

    // Context-sensitive intelligent response generator
    if (q.includes('tired') || q.includes('fatigue') || q.includes('exhausted') || q.includes('low energy')) {
      category = 'Recovery & Energy';
      answer = `Based on your recent biometric logs:\n\n` +
        `• **Sleep Log**: You logged **${sleepHours} hours** of sleep (Target: 8.0 hrs).\n` +
        `• **Readiness Score**: **${recoveryScore}/100**.\n\n` +
        `### Likely Contributors to Fatigue:\n` +
        `1. **Hydration & Electrolytes**: Mild dehydration reduces blood plasma volume, dropping cardiac output and workout vigor. Ensure you reach your daily fluid target.\n` +
        `2. **Carbohydrate Timing**: Since your goal is **${goal}**, ensure you are consuming complex carbs 90-120 minutes before lifting (e.g. oatmeal or bananas).\n` +
        `3. **CNS Accumulation**: If you have had heavy compound sessions over consecutive days, your central nervous system may benefit from a lower-intensity deload or 15 mins of mobility work.\n\n` +
        `💡 *Recommendation*: Sip 500ml water with electrolytes, take a 20-minute power nap, and consider warming up with an extra dynamic stretching round today.`;

      suggestedFollowUps = [
        "What are good pre-workout carb sources?",
        "Should I take a deload week?",
        "How can I improve sleep quality?"
      ];
    } else if (q.includes('high-protein dinner') || q.includes('protein dinner') || q.includes('dinner recipe')) {
      category = 'Nutrition & Recipes';
      answer = `Here is an optimal high-protein dinner calibrated for your **${goal}** protocol:\n\n` +
        `🍽️ **Herb-Crusted Grilled Salmon & Quinoa Power Bowl**\n` +
        `• **Ingredients**:\n` +
        `  - 200g Fresh Atlantic Salmon fillet (approx. 40g Protein, 22g Healthy Fats)\n` +
        `  - 1 cup cooked Quinoa or Brown Jasmine Rice (approx. 8g Protein, 45g Carbs)\n` +
        `  - 150g Steamed Broccoli & Asparagus spears (rich in sulforaphane & micronutrients)\n` +
        `  - 1 tbsp Extra Virgin Olive Oil & Lemon garlic drizzle\n\n` +
        `📊 **Approximate Nutritional Breakdown**:\n` +
        `• **Calories**: ~610 kcal\n` +
        `• **Protein**: ~48g\n` +
        `• **Carbohydrates**: ~48g\n` +
        `• **Healthy Fats**: ~26g\n\n` +
        `*Vegetarian Alternative*: Substitute grilled salmon with 200g Pan-Seared Firm Tofu or Cottage Cheese (Paneer) with 1 cup edamame for equivalent protein density.`;

      suggestedFollowUps = [
        "Give me a quick 30g protein snack",
        "Am I eating enough protein today?",
        "What are the best plant-based protein sources?"
      ];
    } else if (q.includes('enough protein') || q.includes('protein intake') || q.includes('how much protein')) {
      category = 'Macronutrient Analysis';
      const proteinPercent = Math.round((consumedProtein / targetProtein) * 100);
      const remainingProtein = Math.max(0, targetProtein - consumedProtein);

      answer = `### Your Protein Intake Status Today:\n\n` +
        `• **Consumed So Far**: **${consumedProtein}g**\n` +
        `• **Daily Target**: **${targetProtein}g** (based on ${weight}kg bodyweight for **${goal}**)\n` +
        `• **Completion**: **${proteinPercent}%** (${remainingProtein}g remaining)\n\n` +
        (remainingProtein > 0
          ? `You still need **${remainingProtein}g** of protein to hit your optimal muscle-protein synthesis threshold today. A scoop of whey isolate (~26g) or 150g chicken breast / Greek yogurt will bridge this gap perfectly.`
          : `🎉 Excellent! You have already reached your daily protein threshold. This ensures optimal amino acid availability for nocturnal muscle recovery!`);

      suggestedFollowUps = [
        "Give me a high-protein dinner",
        "Does timing of protein matter?",
        "Is creatine safe to take with protein?"
      ];
    } else if (q.includes('chest workout') || q.includes('chest routine') || q.includes('bench press')) {
      category = 'Workout Programming';
      answer = `Here is a high-stimulus **Chest Hypertrophy Routine** built around optimal biomechanics:\n\n` +
        `1. **Flat Barbell Bench Press**\n` +
        `   • 4 Sets × 6-8 Reps (Rest: 120s)\n` +
        `   • *Form Tip*: Retract shoulder blades, maintain a 45-degree elbow tuck, and drive upward through midfoot.\n\n` +
        `2. **Incline Dumbbell Press (30° Angle)**\n` +
        `   • 3 Sets × 8-10 Reps (Rest: 90s)\n` +
        `   • *Focus*: Clavicular upper pectorals. Control the 3-second descent.\n\n` +
        `3. **Weighted or Bodyweight Dips**\n` +
        `   • 3 Sets × 10-12 Reps (Rest: 75s)\n` +
        `   • *Focus*: Lean torso forward 30 degrees to bias the lower sternal chest.\n\n` +
        `4. **Cable Chest Flyes (Mid-Height)**\n` +
        `   • 3 Sets × 12-15 Reps (Rest: 60s)\n` +
        `   • *Focus*: Peak contraction squeeze. Hold the peak tension for 1 second.\n\n` +
        `Warm-up: 5 minutes dynamic shoulder band pass-throughs and 2 progressive light feeder sets on bench press.`;

      suggestedFollowUps = [
        "How do I fix shoulder pain when benching?",
        "What should I eat after this workout?",
        "Why am I feeling tired today?"
      ];
    } else if (q.includes('bulking') || q.includes('cutting') || q.includes('calorie deficit') || q.includes('surplus')) {
      category = 'Goal Strategy';
      answer = `You are currently set to **${goal} Mode** with a target of **${targetCalories} kcal/day**:\n\n` +
        `• **Caloric Surplus Strategy**: A controlled lean surplus of +300 to +400 kcal above maintenance optimizes muscular hypertrophy while keeping adipose gain minimal.\n` +
        `• **Target Rate of Gain**: Aim for 0.25kg to 0.4kg weight gain per week. If weight stagnates for 2 weeks, increment daily carbs by 25g.\n` +
        `• **Progressive Overload**: Ensure training logs show progressive increments in either repetitions or load every microcycle.\n\n` +
        `Track your weekly average morning weight in the **Progress** tab to gauge metabolic rate.`;

      suggestedFollowUps = [
        "How do I calculate maintenance calories?",
        "When should I switch from bulking to cutting?",
        "Am I eating enough protein?"
      ];
    } else {
      category = 'Fit Health Advisor';
      answer = `I can assist you with your **${goal}** program!\n\n` +
        `• Your Current Target: **${targetCalories} kcal** | **${targetProtein}g Protein**\n` +
        `• Recovery Score: **${recoveryScore}/100** | Today's Sleep: **${sleepHours}h**\n\n` +
        `Feel free to ask about workout programming, macro adjustments, post-workout nutrition, fatigue management, or exercise form tips.`;

      suggestedFollowUps = [
        "Why am I feeling tired today?",
        "Give me a high-protein dinner",
        "Create a chest workout for today",
        "Am I eating enough protein?"
      ];
    }

    return res.status(200).json({
      success: true,
      category,
      question,
      answer,
      suggestedFollowUps,
      disclaimer: "Disclaimer: Fit Health AI provides fitness, training, and general nutritional insights for educational purposes. It does not replace professional medical diagnosis, clinical nutrition advice, or personalized physical therapy."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
