// Fit Health Comprehensive Seed Data

const initialGyms = [
  {
    id: "gym_1",
    name: "rsv gym and sports club",
    address: "442 Fitness Boulevard, Downtown Metro",
    latitude: 28.6139,
    longitude: 77.2090,
    rating: 4.9,
    reviewsCount: 384,
    openingHours: "05:00 AM - 11:30 PM",
    equipment: [
      "Eleiko Olympic Barbells & Plates",
      "8 Power Cages & Squat Racks",
      "Dumbbells 2.5kg to 65kg",
      "Dual Adjustable Cable Crossover",
      "GHD & Reverse Hyper",
      "Heavy Duty Leg Press & Hack Squat",
      "Deadlift Platforms with Band Pegs"
    ],
    vibe: "Hardcore Bodybuilding & Strength",
    crowdLevel: "Moderate",
    peakHours: "06:30 PM - 08:30 PM",
    facilities: ["Sauna", "Chilled Cold Plunge", "Locker Rooms with Showers", "Protein Shake Bar", "Certified Strength Coaches"],
    dayPassPrice: 299.00,
    currency: "INR",
    phone: "+91 98765 43210",
    website: "https://rsvgym.example.com",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    instructions: "1. Personal sweat towel is mandatory on all workout floors.\n2. Re-rack all barbell plates, dumbbells, and accessories immediately after sets.\n3. Chalk stations are strictly for Olympic platforms and power cages.\n4. Wipe down cardio screens and bench pads with provided sanitizing spray after use.",
    notice: "Official Gym Notice: Peak floor hours are 06:00 PM - 08:30 PM. Group classes start on the hour."
  },
  {
    id: "gym_2",
    name: "Aura Peak Wellness & Athletic Club",
    address: "108 Horizon Heights, Financial District",
    latitude: 28.6250,
    longitude: 77.2180,
    rating: 4.8,
    reviewsCount: 512,
    openingHours: "24/7 (Access Keycard)",
    equipment: [
      "Technogym Biostrength Series",
      "Woodway Curve Treadmills",
      "Peloton Bikes & Concept2 Rowers",
      "Free Weights 1kg to 45kg",
      "Pilates Reformers Zone",
      "Functional Turf Lane (30m)",
      "Assault Air Bikes"
    ],
    vibe: "Clean, Modern & High-Tech",
    crowdLevel: "Low",
    peakHours: "07:00 AM - 08:30 AM",
    facilities: ["Infrared Sauna", "Cryotherapy Chamber", "Smoothie & Espresso Lounge", "Valet Parking", "Towel Service"],
    dayPassPrice: 499.00,
    currency: "INR",
    phone: "+91 98123 45678",
    website: "https://aurapeak.example.com",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gym_3",
    name: "Apex Cross & Functional Arena",
    address: "22 Industrial Park Road, Westside",
    latitude: 28.6015,
    longitude: 77.1950,
    rating: 4.7,
    reviewsCount: 290,
    openingHours: "05:30 AM - 10:00 PM",
    equipment: [
      "Rogue Infinity Rig (12 Stations)",
      "Bumper Plates & Competition Barbells",
      "Gymnastic Rings & Climbing Ropes",
      "Concept2 SkiErgs & Echo Bikes",
      "Sleds, Prowlers & Farmer Walk Handles",
      "Kettlebells up to 40kg",
      "Plyo Boxes & Medicine Balls"
    ],
    vibe: "High Energy & Community Driven",
    crowdLevel: "High",
    peakHours: "05:30 PM - 07:30 PM",
    facilities: ["Open Air Training Turf", "Physiotherapy Clinic", "Locker Rooms", "Community Event Space"],
    dayPassPrice: 349.00,
    currency: "INR",
    phone: "+91 98234 56789",
    website: "https://apexcross.example.com",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gym_4",
    name: "Titan Powerhouse Gym",
    address: "89 Northway Sector 14",
    latitude: 28.6380,
    longitude: 77.2250,
    rating: 4.9,
    reviewsCount: 420,
    openingHours: "06:00 AM - 11:00 PM",
    equipment: [
      "Prime Fitness Plate Loaded Machines",
      "Arsenal Strength Hack Squat & Pendulum",
      "Cybex Eagle Selectorized Range",
      "Heavy Dumbbells up to 80kg",
      "Deadlift Jacks & Chalk Stations",
      "Multiple Flat & Incline Olympic Benches"
    ],
    vibe: "Old-School Bodybuilding Mecca",
    crowdLevel: "Moderate",
    peakHours: "06:00 PM - 08:30 PM",
    facilities: ["Steam Bath", "Recovery Massage Lounge", "Meal Prep Fridge & Microwave", "Pro Shop"],
    dayPassPrice: 279.00,
    currency: "INR",
    phone: "+91 98345 67890",
    website: "https://titanpowerhouse.example.com",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gym_5",
    name: "PurePulse 24/7 Express",
    address: "51 Central Market Galleria, Level 2",
    latitude: 28.6180,
    longitude: 77.2350,
    rating: 4.6,
    reviewsCount: 650,
    openingHours: "Open 24 Hours Daily",
    equipment: [
      "Matrix Matrix Versa Selectorized System",
      "Free Weights & Smith Machines",
      "Rowers, Stairclimbers, Ellipticals",
      "Stretching & Core Mats Area",
      "TRX Suspension Trainers"
    ],
    vibe: "Casual, Friendly & Accessible",
    crowdLevel: "Low",
    peakHours: "05:00 PM - 07:00 PM",
    facilities: ["Private Changing Cabins", "Filtered Water Stations", "Free High-Speed Wi-Fi", "Automated Vending"],
    dayPassPrice: 199.00,
    currency: "INR",
    phone: "+91 98456 78901",
    website: "https://purepulse.example.com",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gym_6",
    name: "Zenith Kinetic Performance Lab",
    address: "330 Riverside Boulevard, Tech Hub",
    latitude: 28.5950,
    longitude: 77.2150,
    rating: 4.9,
    reviewsCount: 310,
    openingHours: "06:00 AM - 10:00 PM",
    equipment: [
      "Keiser Pneumatic Air Resistance Units",
      "Force Plates & Motion Capture",
      "Olympic Lifting Platforms",
      "Wattbikes & Woodway Curve",
      "Specialty Barbells (Safety Squat, Trap Bar, Swiss Bar)"
    ],
    vibe: "Scientific & Athletic Performance",
    crowdLevel: "Low",
    peakHours: "06:00 PM - 08:00 PM",
    facilities: ["Hyperbaric Chamber", "DEXA Body Composition Scan", "Physical Therapist on Site", "Contrast Hydrotherapy"],
    dayPassPrice: 599.00,
    currency: "INR",
    phone: "+91 98567 89012",
    website: "https://zenithkinetic.example.com",
    image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80"
  }
];

const defaultSplitWorkouts = {
  bulking: [
    {
      dayNumber: 1,
      dayName: "Day 1 — CHEST",
      focus: "Focus. Train. Transform. Pectoral Power & Volume",
      targetGroup: "Chest",
      exercises: [
        { id: "e1", name: "Bench Press", targetMuscle: "Pectoralis Major (Mid & Lower)", sets: 4, reps: "6-10", weight: "80 kg", restTime: 90, completed: true, instructions: "Arch lower back slightly, retract scapulae, lower bar under control to mid-chest, drive up explosively." },
        { id: "e2", name: "Incline Dumbbell Press", targetMuscle: "Upper Clavicular Chest", sets: 4, reps: "8-12", weight: "28 kg", restTime: 90, completed: true, instructions: "Set bench at 30 degrees. Keep elbows at 45 degrees, deep stretch at bottom and squeeze at peak." },
        { id: "e3", name: "Chest Fly", targetMuscle: "Sternal Chest Adduction", sets: 3, reps: "10-15", weight: "15 kg/side", restTime: 60, completed: false, instructions: "Slight bend in elbows. Bring arms together in a hugging motion, squeeze pecs hard at center." },
        { id: "e4", name: "Dumbbell Pullover", targetMuscle: "Upper Chest & Serratus Anterior", sets: 3, reps: "10-15", weight: "22 kg", restTime: 60, completed: false, instructions: "Lie perpendicular across bench. Lower dumbbell behind head with deep ribcage stretch, pull over to chest." },
        { id: "e5", name: "Push Ups", targetMuscle: "Chest & Triceps Finisher", sets: 3, reps: "MAX", weight: "Bodyweight", restTime: 60, completed: false, instructions: "Maintain strong core plank. Lower chest to floor and push up with full range of motion." }
      ]
    },
    {
      dayNumber: 2,
      dayName: "Day 2 — SHOULDER",
      focus: "3D Deltoid Mass, Overhead Power & Traps",
      targetGroup: "Shoulder",
      exercises: [
        { id: "e6", name: "Overhead Press", targetMuscle: "Anterior & Lateral Deltoids", sets: 4, reps: "6-10", weight: "50 kg", restTime: 90, completed: false, instructions: "Brace glutes and abs, press bar in straight vertical path clearing chin, lock out overhead." },
        { id: "e7", name: "Lateral Raise", targetMuscle: "Lateral Deltoids (Cap Width)", sets: 4, reps: "10-15", weight: "12 kg", restTime: 60, completed: false, instructions: "Lead with elbows, slight forward lean, pause at parallel for maximum delt tension." },
        { id: "e8", name: "Front Raise", targetMuscle: "Anterior Deltoid Head", sets: 3, reps: "10-15", weight: "10 kg", restTime: 60, completed: false, instructions: "Raise dumbbells to eye level with controlled tempo. Avoid swinging torso." },
        { id: "e9", name: "Rear Delt Fly", targetMuscle: "Posterior Deltoids", sets: 3, reps: "12-15", weight: "10 kg", restTime: 60, completed: false, instructions: "Hinge forward at 45 degrees or use incline bench. Pull arms wide to isolate rear delts." },
        { id: "e10", name: "Shrugs", targetMuscle: "Upper Trapezius", sets: 3, reps: "12-15", weight: "32 kg/hand", restTime: 60, completed: false, instructions: "Elevate shoulders straight up towards ears, squeeze traps for 1 second, lower under control." }
      ]
    },
    {
      dayNumber: 3,
      dayName: "Day 3 — BICEPS",
      focus: "Arm Thickness, Peak Hypertrophy & Forearms",
      targetGroup: "Biceps",
      exercises: [
        { id: "e11", name: "Barbell Curl", targetMuscle: "Biceps Brachii (Overall Mass)", sets: 4, reps: "6-10", weight: "35 kg", restTime: 75, completed: false, instructions: "Keep elbows pinned to ribs. Curl barbell upward with strong contraction and controlled 3-second eccentric." },
        { id: "e12", name: "Dumbbell Curl", targetMuscle: "Biceps Long & Short Heads", sets: 4, reps: "8-12", weight: "16 kg", restTime: 60, completed: false, instructions: "Supinate wrists as you curl upward to maximize bicep contraction at peak." },
        { id: "e13", name: "Hammer Curl", targetMuscle: "Brachialis & Forearms", sets: 3, reps: "10-12", weight: "14 kg", restTime: 60, completed: false, instructions: "Palms facing each other throughout. Great for arm thickness and grip strength." },
        { id: "e14", name: "Preacher Curl", targetMuscle: "Biceps Short Head (Peak)", sets: 3, reps: "10-12", weight: "28 kg", restTime: 60, completed: false, instructions: "Rest upper arms firmly against angled pad to eliminate momentum and isolate the bicep peak." },
        { id: "e15", name: "Concentration Curl", targetMuscle: "Biceps Isolation Peak", sets: 3, reps: "12-15", weight: "12 kg", restTime: 45, completed: false, instructions: "Sit and brace elbow against inner thigh. Curl dumbbell smoothly with intense focus." }
      ]
    },
    {
      dayNumber: 4,
      dayName: "Day 4 — TRICEPS",
      focus: "Tricep Horseshoe, Lockout Power & Density",
      targetGroup: "Triceps",
      exercises: [
        { id: "e16", name: "Close Grip Bench Press", targetMuscle: "Triceps & Inner Chest", sets: 4, reps: "6-10", weight: "65 kg", restTime: 90, completed: false, instructions: "Grip shoulder-width apart. Keep elbows tucked close to body while pressing to overload triceps." },
        { id: "e17", name: "Rope Push Down", targetMuscle: "Triceps Lateral & Medial Heads", sets: 4, reps: "10-12", weight: "25 kg", restTime: 60, completed: false, instructions: "Spread rope apart at bottom of motion. Lock out triceps hard for 1 second." },
        { id: "e18", name: "Overhead Triceps Ext.", targetMuscle: "Triceps Long Head", sets: 3, reps: "10-12", weight: "24 kg", restTime: 60, completed: false, instructions: "Keep elbows high and stationary. Lower weight behind head for a deep long head stretch." },
        { id: "e19", name: "Dips", targetMuscle: "Triceps & Chest Overload", sets: 3, reps: "MAX", weight: "Bodyweight", restTime: 75, completed: false, instructions: "Stay upright on parallel bars to emphasize triceps. Lower until elbows reach 90 degrees." },
        { id: "e20", name: "Kick Back", targetMuscle: "Triceps Peak Contraction", sets: 3, reps: "12-15", weight: "10 kg", restTime: 45, completed: false, instructions: "Torso parallel to floor, upper arm parallel to torso. Extend forearm back and squeeze." }
      ]
    },
    {
      dayNumber: 5,
      dayName: "Day 5 — BACK",
      focus: "V-Taper Lats, Mid-Back Thickness & Deadlift Power",
      targetGroup: "Back",
      exercises: [
        { id: "e21", name: "Pull Ups", targetMuscle: "Latissimus Dorsi (V-Taper Width)", sets: 4, reps: "6-10", weight: "Bodyweight", restTime: 90, completed: false, instructions: "Dead hang at bottom, drive elbows down to ribs, pull chest up toward bar." },
        { id: "e22", name: "Barbell Row", targetMuscle: "Rhomboids, Lats & Mid-Back", sets: 4, reps: "8-12", weight: "70 kg", restTime: 90, completed: false, instructions: "Hinge at 45 degrees, pull bar towards belly button, pinch shoulder blades together tightly." },
        { id: "e23", name: "Lat Pulldown", targetMuscle: "Upper Lats & Teres Major", sets: 4, reps: "10-12", weight: "65 kg", restTime: 60, completed: false, instructions: "Pull bar smoothly down to upper chest while leaning back slightly. Control the ascent." },
        { id: "e24", name: "Seated Cable Row", targetMuscle: "Mid-Back & Lower Lats", sets: 3, reps: "10-12", weight: "60 kg", restTime: 60, completed: false, instructions: "Sit upright with neutral spine. Pull attachment into lower abdomen and squeeze back." },
        { id: "e25", name: "Deadlift", targetMuscle: "Full Posterior Chain & Traps", sets: 3, reps: "6-8", weight: "120 kg", restTime: 120, completed: false, instructions: "Bar over midfoot, chest proud, brace core, drive through heels to full standing lockout." }
      ]
    },
    {
      dayNumber: 6,
      dayName: "Day 6 — LEGS",
      focus: "Quad Teardrop, Hamstring Sweep & Calf Power",
      targetGroup: "Legs",
      exercises: [
        { id: "e26", name: "Barbell Squat", targetMuscle: "Quadriceps & Glutes", sets: 4, reps: "6-10", weight: "100 kg", restTime: 120, completed: false, instructions: "Feet shoulder-width, brace abdominal wall, descend below parallel, drive up through midfoot." },
        { id: "e27", name: "Leg Press", targetMuscle: "Quadriceps & Adductors", sets: 4, reps: "10-12", weight: "200 kg", restTime: 90, completed: false, instructions: "Position feet mid-platform. Lower sled with control without lifting pelvis, press without knee lockout." },
        { id: "e28", name: "Leg Extension", targetMuscle: "Quad Teardrop (VMO)", sets: 3, reps: "10-15", weight: "55 kg", restTime: 60, completed: false, instructions: "Extend legs fully, hold peak contraction at top for 1 full second, lower with 3-second negative." },
        { id: "e29", name: "Leg Curl", targetMuscle: "Hamstrings & Knee Flexors", sets: 3, reps: "10-15", weight: "50 kg", restTime: 60, completed: false, instructions: "Lie flat on machine pad. Curl heels up toward glutes with strong hamstring squeeze." },
        { id: "e30", name: "Calf Raise", targetMuscle: "Gastrocnemius & Soleus", sets: 4, reps: "12-20", weight: "70 kg", restTime: 45, completed: false, instructions: "Full stretch at bottom, explode up onto toes and hold at top for 2 seconds." }
      ]
    },
    {
      dayNumber: 7,
      dayName: "Day 7 — RECOVERY & MOBILITY",
      focus: "Active Recovery, Muscle Repair & CNS Restoration",
      targetGroup: "Recovery",
      exercises: [
        { id: "e31", name: "Light 30-min Zone 2 Walk", targetMuscle: "Cardiovascular & Recovery", sets: 1, reps: "30 mins", weight: "Bodyweight", restTime: 0, completed: false, instructions: "Gentle brisk walk to stimulate lymphatic drainage, blood circulation, and active recovery." },
        { id: "e32", name: "Full Body Dynamic Stretching", targetMuscle: "Joint Mobility & Fascia", sets: 1, reps: "15 mins", weight: "Bodyweight", restTime: 0, completed: false, instructions: "Perform guided hip openers, shoulder dislocations, and thoracic spine rotations." }
      ]
    }
  ]
};

const foodDatabase = [
  { id: "f1", name: "Boneless Skinless Chicken Breast", category: "Protein", servingSize: "100g", calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0 },
  { id: "f2", name: "Whole Large Eggs (2 Eggs)", category: "Protein", servingSize: "100g (approx 2 eggs)", calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0.0 },
  { id: "f3", name: "Egg Whites", category: "Protein", servingSize: "100ml", calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2, fiber: 0.0 },
  { id: "f4", name: "Whey Protein Isolate (1 Scoop)", category: "Supplements", servingSize: "30g", calories: 120, protein: 26.0, carbs: 1.5, fat: 1.0, fiber: 0.0 },
  { id: "f5", name: "Rolled Oats", category: "Carbs", servingSize: "60g", calories: 233, protein: 8.0, carbs: 40.0, fat: 4.0, fiber: 6.0 },
  { id: "f6", name: "Brown Rice (Cooked)", category: "Carbs", servingSize: "150g", calories: 165, protein: 3.5, carbs: 35.0, fat: 1.4, fiber: 2.5 },
  { id: "f7", name: "Sweet Potato (Baked)", category: "Carbs", servingSize: "150g", calories: 135, protein: 3.0, carbs: 31.0, fat: 0.2, fiber: 4.5 },
  { id: "f8", name: "Atlantic Salmon Fillet", category: "Protein & Fats", servingSize: "120g", calories: 247, protein: 24.0, carbs: 0.0, fat: 16.0, fiber: 0.0 },
  { id: "f9", name: "Lean Ground Beef (90/10)", category: "Protein", servingSize: "120g", calories: 210, protein: 24.0, carbs: 0.0, fat: 12.0, fiber: 0.0 },
  { id: "f10", name: "Non-Fat Greek Yogurt", category: "Dairy & Protein", servingSize: "170g (3/4 cup)", calories: 100, protein: 17.0, carbs: 6.0, fat: 0.7, fiber: 0.0 },
  { id: "f11", name: "Cottage Cheese / Low-fat Paneer", category: "Dairy & Protein", servingSize: "100g", calories: 98, protein: 14.0, carbs: 3.4, fat: 4.0, fiber: 0.0 },
  { id: "f12", name: "Natural Peanut Butter", category: "Healthy Fats", servingSize: "32g (2 tbsp)", calories: 188, protein: 8.0, carbs: 6.0, fat: 16.0, fiber: 2.0 },
  { id: "f13", name: "Fresh Hass Avocado", category: "Healthy Fats", servingSize: "100g (1/2 avocado)", calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7 },
  { id: "f14", name: "Fresh Raw Almonds", category: "Healthy Fats", servingSize: "30g (handful)", calories: 173, protein: 6.0, carbs: 6.0, fat: 15.0, fiber: 3.5 },
  { id: "f15", name: "Steamed Fresh Broccoli", category: "Vegetables", servingSize: "100g", calories: 35, protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6 },
  { id: "f16", name: "Medium Ripe Banana", category: "Carbs & Fruit", servingSize: "118g (1 banana)", calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3, fiber: 3.1 },
  { id: "f17", name: "Fresh Blueberries", category: "Fruit", servingSize: "100g", calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4 },
  { id: "f18", name: "Extra Virgin Olive Oil", category: "Healthy Fats", servingSize: "14ml (1 tbsp)", calories: 119, protein: 0.0, carbs: 0.0, fat: 13.5, fiber: 0.0 },
  { id: "f19", name: "Whole Grain Bread", category: "Carbs", servingSize: "2 slices (70g)", calories: 160, protein: 8.0, carbs: 28.0, fat: 2.0, fiber: 4.0 },
  { id: "f20", name: "Firm Tofu", category: "Plant Protein", servingSize: "120g", calories: 120, protein: 14.0, carbs: 3.0, fat: 6.0, fiber: 1.5 }
];

const supplementCatalog = [
  {
    id: "sup_1",
    name: "Whey Protein Isolate & Concentrate",
    brand: "Optimum Nutrition / MuscleBlaze Biozyme",
    category: "Protein",
    tagline: "Ultra-pure fast-absorbing protein delivering 25g protein and 5.5g BCAAs per scoop.",
    image: "/images/supplements/whey-protein-isolate.jpg",
    imageUrl: "/images/supplements/whey-protein-isolate.jpg",
    fallbackImage: "/images/supplements/whey-protein-isolate.jpg",
    shoppingLinks: [],
    rating: 4.9,
    reviewsCount: 14850,
    price: 54.99,
    originalPrice: 69.99,
    currency: "USD",
    inrPrice: "₹4,299",
    originalInrPrice: "₹5,499",
    discount: "22% OFF",
    certifications: ["Informed-Choice Tested", "Labdoor Certified", "GMP Quality"],
    flavorOptions: ["Double Rich Chocolate", "Vanilla Ice Cream", "Mocha Cappuccino"],
    purpose: "Supports rapid muscle protein synthesis (MPS), repairs micro-tears from heavy resistance training, and helps meet daily macronutrient goals cleanly.",
    commonUsage: "1 to 2 scoops (30g-60g) mixed with 250ml water, almond milk, or blended in oat smoothies.",
    timing: "Post-workout within 45 minutes, or between meals as a high-protein anabolic bridge.",
    considerations: "If lactose-sensitive, choose 100% Whey Isolate or Plant Pea-Rice blend for zero bloating.",
    safetyDisclaimer: "Supplements complement whole foods. Drink plenty of water and consult your physician if you have kidney conditions.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Fast Prime Delivery",
        price: "$54.99",
        inrPrice: "₹4,299",
        url: "https://www.amazon.in/s?k=optimum+nutrition+whey+protein+gold+standard",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult.fit Official",
        price: "$51.99",
        inrPrice: "₹3,999",
        url: "https://www.cult.fit/store/nutrition/proteins",
        color: "#f97316"
      },
      {
        store: "MyProtein",
        badge: "Direct Factory",
        price: "$49.99",
        inrPrice: "₹3,899",
        url: "https://www.myprotein.co.in/nutrition/protein.list",
        color: "#0284c7"
      },
      {
        store: "iHerb",
        badge: "Global Verified",
        price: "$56.00",
        inrPrice: "₹4,350",
        url: "https://www.iherb.com/c/whey-protein",
        color: "#16a34a"
      }
    ]
  },
  {
    id: "sup_2",
    name: "Micronized Creatine Monohydrate (Creapure)",
    brand: "Creapure / MuscleBlaze / Thorne",
    category: "Strength",
    tagline: "Gold standard 99.99% pure micronized creatine for explosive power and muscle volume.",
    image: "/images/supplements/creapure-creatine-monohydrate.jpg",
    imageUrl: "/images/supplements/creapure-creatine-monohydrate.jpg",
    fallbackImage: "/images/supplements/creapure-creatine-monohydrate.jpg",
    shoppingLinks: [],
    rating: 4.9,
    reviewsCount: 22400,
    price: 24.99,
    originalPrice: 32.99,
    currency: "USD",
    inrPrice: "₹1,299",
    originalInrPrice: "₹1,799",
    discount: "28% OFF",
    certifications: ["Creapure Germany", "NSF Certified for Sport", "Zero Sugar"],
    flavorOptions: ["Unflavored", "Fruit Punch", "Tangy Orange"],
    purpose: "Increases phosphocreatine cellular reserves to rapidly re-synthesize ATP during heavy lifting, boosting max strength, power output, and intracellular cell volumization.",
    commonUsage: "3 to 5 grams daily continuously. No mandatory loading phase needed.",
    timing: "Daily with 300ml water, fruit juice, or your post-workout protein shake.",
    considerations: "Draws intracellular water into muscle cells, boosting muscle fullness. Maintain hydration at 3.5L+ water daily.",
    safetyDisclaimer: "One of the most scientifically studied sports supplements in history. Safe for long-term daily use.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Best Seller",
        price: "$24.99",
        inrPrice: "₹1,299",
        url: "https://www.amazon.in/s?k=creatine+monohydrate+creapure",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult.fit Verified",
        price: "$22.99",
        inrPrice: "₹1,199",
        url: "https://www.cult.fit/store/nutrition/creatine",
        color: "#f97316"
      },
      {
        store: "Nutrabay",
        badge: "Authenticity Guaranteed",
        price: "$23.50",
        inrPrice: "₹1,249",
        url: "https://nutrabay.com/product-category/creatine",
        color: "#8b5cf6"
      }
    ]
  },
  {
    id: "sup_3",
    name: "C4 Explosive Pre-Workout & Beta-Alanine",
    brand: "Cellucor / Gorilla Mind / Fast&Up",
    category: "Endurance",
    tagline: "High-intensity energy matrix with 200mg Caffeine, Beta-Alanine, and Nitric Oxide pump boosters.",
    image: "/images/supplements/c4-explosive-preworkout.jpg",
    imageUrl: "/images/supplements/c4-explosive-preworkout.jpg",
    fallbackImage: "/images/supplements/c4-explosive-preworkout.jpg",
    shoppingLinks: [],
    rating: 4.8,
    reviewsCount: 9600,
    price: 34.99,
    originalPrice: 44.99,
    currency: "USD",
    inrPrice: "₹2,499",
    originalInrPrice: "₹3,299",
    discount: "24% OFF",
    certifications: ["Informed Choice", "cGMP Facility", "Zero Crash Formula"],
    flavorOptions: ["Icy Blue Razz", "Fruit Punch", "Watermelon Rush"],
    purpose: "Heightens mental focus, surges nitric oxide vasodilation for intense muscle pumps, and buffers lactic acid burn during high-rep sets.",
    commonUsage: "1 level scoop in 200-250ml chilled water 20 to 30 minutes prior to training.",
    timing: "20-30 minutes before workout. Avoid within 5 hours of bedtime.",
    considerations: "Beta-Alanine may cause a harmless, transient tingling sensation (paresthesia). Start with half a scoop to assess tolerance.",
    safetyDisclaimer: "Contains high caffeine. Not suitable for individuals sensitive to stimulants or with hypertension.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Top Rated",
        price: "$34.99",
        inrPrice: "₹2,499",
        url: "https://www.amazon.in/s?k=cellucor+c4+pre+workout",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Certified",
        price: "$32.99",
        inrPrice: "₹2,349",
        url: "https://www.cult.fit/store/nutrition/pre-workout",
        color: "#f97316"
      },
      {
        store: "iHerb",
        badge: "Special Deal",
        price: "$33.99",
        inrPrice: "₹2,420",
        url: "https://www.iherb.com/c/pre-workout-formulas",
        color: "#16a34a"
      }
    ]
  },
  {
    id: "sup_4",
    name: "BCAAs 2:1:1 + Electrolytes Intra-Workout",
    brand: "Scivation XTEND / Fast&Up BCAA",
    category: "Endurance",
    tagline: "7g BCAAs with L-Glutamine and essential electrolyte matrix for sustained intra-set stamina.",
    image: "/images/supplements/xtend-bcaas-electrolytes.jpg",
    imageUrl: "/images/supplements/xtend-bcaas-electrolytes.jpg",
    fallbackImage: "/images/supplements/xtend-bcaas-electrolytes.jpg",
    shoppingLinks: [],
    rating: 4.7,
    reviewsCount: 8150,
    price: 28.99,
    originalPrice: 38.99,
    currency: "USD",
    inrPrice: "₹1,999",
    originalInrPrice: "₹2,699",
    discount: "26% OFF",
    certifications: ["NSF Certified", "Sugar Free", "Zero Calories"],
    flavorOptions: ["Mango Madness", "Blue Raspberry Ice", "Watermelon Explosion"],
    purpose: "Suppresses muscle catabolism during demanding training sessions, curbs central nervous system fatigue, and accelerates intra-workout recovery.",
    commonUsage: "1 scoop dissolved in 500-700ml cold water sipped continuously throughout your session.",
    timing: "Sipped during training or before fasted morning cardio.",
    considerations: "Delicious hydration booster. If daily protein target is already high, primary value is hydration and flavor.",
    safetyDisclaimer: "Dietary supplement for athletes. Keep container sealed in a dry environment.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Prime Deal",
        price: "$28.99",
        inrPrice: "₹1,999",
        url: "https://www.amazon.in/s?k=xtend+bcaa+intra+workout",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Store Special",
        price: "$26.99",
        inrPrice: "₹1,849",
        url: "https://www.cult.fit/store/nutrition/bcaa",
        color: "#f97316"
      },
      {
        store: "MyProtein",
        badge: "Direct Factory",
        price: "$27.50",
        inrPrice: "₹1,899",
        url: "https://www.myprotein.co.in/sports-nutrition/bcaa.list",
        color: "#0284c7"
      }
    ]
  },
  {
    id: "sup_5",
    name: "Triple Strength Omega-3 Fish Oil (EPA & DHA)",
    brand: "Nordic Naturals / MuscleBlaze / TrueBasics",
    category: "Joint",
    tagline: "High-concentration molecularly distilled fish oil with 1,000mg active EPA & DHA per softgel.",
    image: "/images/supplements/triple-strength-omega3.jpg",
    imageUrl: "/images/supplements/triple-strength-omega3.jpg",
    fallbackImage: "/images/supplements/triple-strength-omega3.jpg",
    shoppingLinks: [],
    rating: 4.9,
    reviewsCount: 16300,
    price: 29.99,
    originalPrice: 39.99,
    currency: "USD",
    inrPrice: "₹1,199",
    originalInrPrice: "₹1,699",
    discount: "29% OFF",
    certifications: ["IFOS 5-Star Tested", "Heavy Metal Free", "Burp-Less Enteric Coating"],
    flavorOptions: ["Lemon Fresh Softgels", "Natural Unflavored"],
    purpose: "Lubricates synovial joints, mitigates delayed onset muscle soreness (DOMS), supports heart cardiovascular metrics, and enhances arterial elasticity.",
    commonUsage: "1 to 2 softgels daily with a meal containing dietary fats for maximum absorption.",
    timing: "With breakfast or dinner.",
    considerations: "Enteric coating prevents any fishy aftertaste or burps.",
    safetyDisclaimer: "Consult your doctor if taking anticoagulant blood-thinning medications.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Choice Award",
        price: "$29.99",
        inrPrice: "₹1,199",
        url: "https://www.amazon.in/s?k=triple+strength+omega+3+fish+oil",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Verified",
        price: "$27.99",
        inrPrice: "₹1,099",
        url: "https://www.cult.fit/store/nutrition/omega-3",
        color: "#f97316"
      },
      {
        store: "iHerb",
        badge: "IFOS Rated",
        price: "$31.50",
        inrPrice: "₹1,250",
        url: "https://www.iherb.com/c/omega-3-fish-oil",
        color: "#16a34a"
      }
    ]
  },
  {
    id: "sup_6",
    name: "Fast&Up Reload Effervescent Electrolytes",
    brand: "Fast&Up / Liquid I.V. / LMNT",
    category: "Hydration",
    tagline: "Rapid cellular rehydration tabs packed with Sodium, Potassium, Magnesium, and Vitamin C.",
    image: "/images/supplements/fastandup-reload-electrolytes.jpg",
    imageUrl: "/images/supplements/fastandup-reload-electrolytes.jpg",
    fallbackImage: "/images/supplements/fastandup-reload-electrolytes.jpg",
    shoppingLinks: [],
    rating: 4.8,
    reviewsCount: 11200,
    price: 16.99,
    originalPrice: 22.99,
    currency: "USD",
    inrPrice: "₹699",
    originalInrPrice: "₹950",
    discount: "26% OFF",
    certifications: ["WADA Compliant", "Informed Choice", "Zero Added Sugar"],
    flavorOptions: ["Citrus Blast", "Berry Punch", "Cola", "Orange Zest"],
    purpose: "Eliminates muscular cramps, restores intracellular electrolyte balance lost through heavy perspiration, and sustains blood plasma volume.",
    commonUsage: "Drop 1 effervescent tablet into 500ml water, let dissolve for 60 seconds, and drink.",
    timing: "During or directly following intense workout and cardio sessions.",
    considerations: "Ideal for high-heat training sessions and endurance sports.",
    safetyDisclaimer: "Store in a cool dry tube. Do not exceed 3 tablets in 24 hours.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Lightning Fast",
        price: "$16.99",
        inrPrice: "₹699",
        url: "https://www.amazon.in/s?k=fast+and+up+reload+electrolytes",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Official Partner",
        price: "$14.99",
        inrPrice: "₹599",
        url: "https://www.cult.fit/store/nutrition/hydration",
        color: "#f97316"
      },
      {
        store: "Flipkart",
        badge: "Super Saver",
        price: "$15.50",
        inrPrice: "₹649",
        url: "https://www.flipkart.com/search?q=fast+and+up+reload",
        color: "#2563eb"
      }
    ]
  },
  {
    id: "sup_7",
    name: "MuscleTech Platinum Multi-Vitamin & Minerals",
    brand: "MuscleTech / Thorne / GNC",
    category: "Micro",
    tagline: "High-potency 20+ micronutrient matrix fortified with 865mg Amino Support & Herbal extracts.",
    image: "/images/supplements/muscletech-platinum-multivitamin.jpg",
    imageUrl: "/images/supplements/muscletech-platinum-multivitamin.jpg",
    fallbackImage: "/images/supplements/muscletech-platinum-multivitamin.jpg",
    shoppingLinks: [],
    rating: 4.8,
    reviewsCount: 7800,
    price: 19.99,
    originalPrice: 27.99,
    currency: "USD",
    inrPrice: "₹1,099",
    originalInrPrice: "₹1,499",
    discount: "27% OFF",
    certifications: ["USP Verified Grade", "GMP Manufacturing", "Gluten Free"],
    flavorOptions: ["Coated Easy-Swallow Caplets"],
    purpose: "Fills dietary micro-gaps, optimizes metabolic enzyme synthesis, boosts immune resistance, and supports thyroid hormone conversion.",
    commonUsage: "1 serving (2 caplets) once daily with your morning breakfast.",
    timing: "With the first solid meal of the day.",
    considerations: "Take with food to prevent zinc-induced mild nausea.",
    safetyDisclaimer: "Do not exceed stated daily dose. Keep out of reach of children.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Best Value",
        price: "$19.99",
        inrPrice: "₹1,099",
        url: "https://www.amazon.in/s?k=muscletech+platinum+multivitamin",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Approved",
        price: "$18.49",
        inrPrice: "₹999",
        url: "https://www.cult.fit/store/nutrition/vitamins",
        color: "#f97316"
      },
      {
        store: "iHerb",
        badge: "Global Verified",
        price: "$20.50",
        inrPrice: "₹1,150",
        url: "https://www.iherb.com/c/multivitamins",
        color: "#16a34a"
      }
    ]
  },
  {
    id: "sup_8",
    name: "KSM-66 Organic Ashwagandha (5% Withanolides)",
    brand: "Himalaya / NutraBio / Organic India",
    category: "Joint",
    tagline: "Full-spectrum root extract clinically proven to lower cortisol and optimize natural vitality.",
    image: "/images/supplements/ksm66-organic-ashwagandha.jpg",
    imageUrl: "/images/supplements/ksm66-organic-ashwagandha.jpg",
    fallbackImage: "/images/supplements/ksm66-organic-ashwagandha.jpg",
    shoppingLinks: [],
    rating: 4.9,
    reviewsCount: 13500,
    price: 21.99,
    originalPrice: 29.99,
    currency: "USD",
    inrPrice: "₹899",
    originalInrPrice: "₹1,299",
    discount: "30% OFF",
    certifications: ["KSM-66 Gold Certified", "100% Organic", "Non-GMO"],
    flavorOptions: ["Veg Capsules (600mg)"],
    purpose: "Reduces circulating serum cortisol levels by up to 27%, promotes deep Stage 4 REM sleep, and increases natural free testosterone in strength athletes.",
    commonUsage: "1 capsule (600mg) with warm milk or dinner.",
    timing: "30-45 minutes before sleep.",
    considerations: "Take consistently for 4-6 weeks for full adaptogenic hormone modulation.",
    safetyDisclaimer: "Consult a healthcare specialist if pregnant or on thyroid hormone medications.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Top Organic Pick",
        price: "$21.99",
        inrPrice: "₹899",
        url: "https://www.amazon.in/s?k=ksm+66+ashwagandha+organic",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Wellness",
        price: "$19.99",
        inrPrice: "₹799",
        url: "https://www.cult.fit/store/nutrition/ayurveda",
        color: "#f97316"
      },
      {
        store: "Flipkart",
        badge: "Fast Delivery",
        price: "$20.50",
        inrPrice: "₹849",
        url: "https://www.flipkart.com/search?q=ksm+66+ashwagandha",
        color: "#2563eb"
      }
    ]
  },
  {
    id: "sup_9",
    name: "ZMA Night Recovery (Zinc, Magnesium & B6)",
    brand: "Universal Nutrition / NOW Sports / MuscleBlaze",
    category: "Micro",
    tagline: "Bioavailable Zinc L-Monomethionine & Magnesium Aspartate for muscle relaxation and restorative sleep.",
    image: "/images/supplements/zma-night-recovery.jpg",
    imageUrl: "/images/supplements/zma-night-recovery.jpg",
    fallbackImage: "/images/supplements/zma-night-recovery.jpg",
    shoppingLinks: [],
    rating: 4.8,
    reviewsCount: 6400,
    price: 23.99,
    originalPrice: 31.99,
    currency: "USD",
    inrPrice: "₹999",
    originalInrPrice: "₹1,399",
    discount: "28% OFF",
    certifications: ["SNAC System ZMA", "Lab Tested", "No Dairy/Soy"],
    flavorOptions: ["Standard Capsules"],
    purpose: "Calms central nervous system overstimulation, relaxes tense muscles, promotes deeper sleep quality, and prevents zinc depletion caused by hard gym sessions.",
    commonUsage: "3 capsules for men (2 for women) on an empty stomach 30-60 minutes before bedtime.",
    timing: "Before bedtime. Avoid taking with calcium/dairy products as calcium blocks zinc absorption.",
    considerations: "Take away from dairy for optimal absorption.",
    safetyDisclaimer: "Do not exceed recommended dose.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Sleep & Recovery Best",
        price: "$23.99",
        inrPrice: "₹999",
        url: "https://www.amazon.in/s?k=zma+zinc+magnesium+recovery",
        color: "#f59e0b"
      },
      {
        store: "iHerb",
        badge: "Official SNAC",
        price: "$22.99",
        inrPrice: "₹949",
        url: "https://www.iherb.com/c/zma",
        color: "#16a34a"
      },
      {
        store: "Nutrabay",
        badge: "Verified Seller",
        price: "$23.50",
        inrPrice: "₹980",
        url: "https://nutrabay.com/product-category/zma",
        color: "#8b5cf6"
      }
    ]
  },
  {
    id: "sup_10",
    name: "Pintola All-Natural Peanut Butter (Crunchy / 100% Roasted Peanuts)",
    brand: "Pintola",
    category: "Healthy Fats & Nut Butters",
    tagline: "100% roasted bold-grade runner peanuts with 30g pure plant protein and zero added sugar or hydrogenated oils.",
    image: "/images/supplements/pintola-all-natural-peanut-butter.jpg",
    imageUrl: "/images/supplements/pintola-all-natural-peanut-butter.jpg",
    fallbackImage: "/images/supplements/pintola-all-natural-peanut-butter.jpg",
    shoppingLinks: [],
    rating: 4.9,
    reviewsCount: 28400,
    price: 6.49,
    originalPrice: 8.99,
    currency: "USD",
    inrPrice: "₹449",
    originalInrPrice: "₹599",
    discount: "25% OFF",
    certifications: [
      "100% Pure Peanuts",
      "Zero Added Sugar",
      "Non-GMO Verified",
      "Gluten Free & Vegan"
    ],
    flavorOptions: [
      "Crunchy Roasted",
      "Smooth & Creamy",
      "Extra Dark Roasted"
    ],
    purpose: "Provides slow-digesting healthy monounsaturated fatty acids, dietary fiber, and plant protein to fuel prolonged workouts, support joint integrity, and sustain caloric surplus during clean bulking.",
    commonUsage: "32g (2 level tablespoons) spread onto wholegrain toast, stirred into warm morning oatmeal, or blended into post-workout banana protein shakes.",
    timing: "Morning breakfast, pre-workout energy fuel (1 hour before), or before bedtime for overnight amino release.",
    considerations: "Natural oil separation is normal for 100% natural nut butters with no emulsifiers. Stir thoroughly before use.",
    safetyDisclaimer: "Contains peanuts. Not suitable for individuals with tree nut or peanut allergies.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Amazon's Choice",
        price: "$6.49",
        inrPrice: "₹449",
        url: "https://www.amazon.in/s?k=pintola+all+natural+peanut+butter+crunchy",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Official Store",
        price: "$5.99",
        inrPrice: "₹419",
        url: "https://www.cult.fit/store/nutrition/peanut-butter",
        color: "#f97316"
      },
      {
        store: "Flipkart",
        badge: "Super Deal",
        price: "$6.20",
        inrPrice: "₹429",
        url: "https://www.flipkart.com/search?q=pintola+peanut+butter",
        color: "#2563eb"
      }
    ]
  },
  {
    id: "sup_11",
    name: "MyFitness High Protein Dark Chocolate Peanut Butter",
    brand: "MyFitness",
    category: "Healthy Fats & Nut Butters",
    tagline: "India's highest rated athlete chocolate peanut butter infused with Belgian dark cocoa and whey protein isolate.",
    image: "/images/supplements/myfitness-chocolate-peanut-butter.jpg",
    imageUrl: "/images/supplements/myfitness-chocolate-peanut-butter.jpg",
    fallbackImage: "/images/supplements/myfitness-chocolate-peanut-butter.jpg",
    shoppingLinks: [],
    rating: 4.9,
    reviewsCount: 34500,
    price: 8.99,
    originalPrice: 11.99,
    currency: "USD",
    inrPrice: "₹599",
    originalInrPrice: "₹799",
    discount: "25% OFF",
    certifications: [
      "US FDA Registered",
      "Whey Isolate Infused",
      "Zero Cholesterol & Trans Fat",
      "100% Vegetarian"
    ],
    flavorOptions: [
      "Crispy Dark Chocolate",
      "Smooth Dark Chocolate",
      "Original American"
    ],
    purpose: "Delivers 26g muscle-building protein per 100g with luxurious Belgian dark chocolate taste, eliminating sweet cravings while maintaining strict bodybuilding macronutrient ratios.",
    commonUsage: "32g (2 tablespoons) with high-fiber sliced apples, rice cakes, protein crepes, or directly by the spoon.",
    timing: "Ideal healthy snack between meals or 45 minutes prior to heavy leg/back training sessions.",
    considerations: "Crispy version contains brown rice crisps for an addictive crunch.",
    safetyDisclaimer: "Contains dairy (whey isolate) and roasted peanuts. Keep in a cool, dry place.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Top Seller",
        price: "$8.99",
        inrPrice: "₹599",
        url: "https://www.amazon.in/s?k=myfitness+chocolate+peanut+butter+crunchy",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Verified",
        price: "$8.49",
        inrPrice: "₹569",
        url: "https://www.cult.fit/store/nutrition/peanut-butter",
        color: "#f97316"
      },
      {
        store: "Flipkart",
        badge: "Fast Delivery",
        price: "$8.75",
        inrPrice: "₹580",
        url: "https://www.flipkart.com/search?q=myfitness+chocolate+peanut+butter",
        color: "#2563eb"
      }
    ]
  },
  {
    id: "sup_12",
    name: "MuscleBlaze High Protein Dark Chocolate Oats (with Probiotics)",
    brand: "MuscleBlaze",
    category: "Breakfast & Super Grains",
    tagline: "22g high-grade protein per serving with rolled oats, premium whey isolate, real dark cocoa, and gut-healthy probiotics.",
    image: "/images/supplements/muscleblaze-high-protein-oats.jpg",
    imageUrl: "/images/supplements/muscleblaze-high-protein-oats.jpg",
    fallbackImage: "/images/supplements/muscleblaze-high-protein-oats.jpg",
    shoppingLinks: [],
    rating: 4.8,
    reviewsCount: 18900,
    price: 9.99,
    originalPrice: 13.99,
    currency: "USD",
    inrPrice: "₹699",
    originalInrPrice: "₹999",
    discount: "30% OFF",
    certifications: [
      "Labdoor USA Tested",
      "Added Probiotics",
      "High Dietary Fiber (10g)",
      "Zero Added Sugar"
    ],
    flavorOptions: [
      "Dark Chocolate",
      "Fruit & Nut Medley",
      "Classic Masala Kick"
    ],
    purpose: "Supercharges morning energy, provides sustained glycogen replenishment with slow-burning complex beta-glucan carbs, and accelerates post-sleep muscle recovery.",
    commonUsage: "Cook 50g-75g in 200ml warm skim milk or water for 3 minutes on low heat, or prepare as overnight oats.",
    timing: "Breakfast within 1 hour of waking, or 90 minutes pre-workout for continuous training stamina.",
    considerations: "Fortified with LactoSpore probiotics to maximize protein absorption and prevent digestive distress.",
    safetyDisclaimer: "Packed in a facility handling milk, nuts, and cereals.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Top Breakfast Pick",
        price: "$9.99",
        inrPrice: "₹699",
        url: "https://www.amazon.in/s?k=muscleblaze+high+protein+dark+chocolate+oats",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Nutrition",
        price: "$9.49",
        inrPrice: "₹649",
        url: "https://www.cult.fit/store/nutrition/oats",
        color: "#f97316"
      },
      {
        store: "Nutrabay",
        badge: "Direct Factory",
        price: "$9.80",
        inrPrice: "₹675",
        url: "https://nutrabay.com/product-category/oats",
        color: "#8b5cf6"
      }
    ]
  },
  {
    id: "sup_13",
    name: "Quaker 100% Wholegrain Rolled Oats",
    brand: "Quaker",
    category: "Breakfast & Super Grains",
    tagline: "World's iconic 100% whole grain oats rich in beta-glucan soluble fiber to lower cholesterol and sustain stamina.",
    image: "/images/supplements/quaker-rolled-oats.jpg",
    imageUrl: "/images/supplements/quaker-rolled-oats.jpg",
    fallbackImage: "/images/supplements/quaker-rolled-oats.jpg",
    shoppingLinks: [],
    rating: 4.8,
    reviewsCount: 42000,
    price: 3.99,
    originalPrice: 4.99,
    currency: "USD",
    inrPrice: "₹249",
    originalInrPrice: "₹320",
    discount: "22% OFF",
    certifications: [
      "100% Whole Grain",
      "Heart Health Mark",
      "Zero Sodium & Sugar",
      "Naturally Preservative Free"
    ],
    flavorOptions: [
      "Traditional Rolled Oats",
      "Instant Cook (Quick)",
      "Homestyle Masala"
    ],
    purpose: "Serves as the ultimate clean carbohydrate backbone for bodybuilders and fitness enthusiasts, stabilizing blood glucose spikes and providing continuous steady-state insulin response.",
    commonUsage: "Boil 60g in 250ml water/milk for 3 minutes. Top with whey protein, chia seeds, sliced berries, and peanut butter.",
    timing: "Ideal morning foundation or 2 hours prior to endurance/weight training.",
    considerations: "Naturally low glycemic index (GI ~55).",
    safetyDisclaimer: "Store in an airtight container away from moisture.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Pantry Best Seller",
        price: "$3.99",
        inrPrice: "₹249",
        url: "https://www.amazon.in/s?k=quaker+rolled+oats+1kg",
        color: "#f59e0b"
      },
      {
        store: "Blinkit",
        badge: "10-Min Delivery",
        price: "$3.80",
        inrPrice: "₹239",
        url: "https://blinkit.com/s/?q=quaker+oats",
        color: "#eab308"
      },
      {
        store: "Flipkart",
        badge: "Super Value",
        price: "$3.95",
        inrPrice: "₹245",
        url: "https://www.flipkart.com/search?q=quaker+oats+1kg",
        color: "#2563eb"
      }
    ]
  },
  {
    id: "sup_14",
    name: "MuscleBlaze High Protein Crunchy Dark Chocolate Muesli",
    brand: "MuscleBlaze",
    category: "Breakfast & Super Grains",
    tagline: "Crunchy multigrain muesli loaded with 25g protein, 22% almonds and pumpkin seeds, and rich dark chocolate curls.",
    image: "/images/supplements/muscleblaze-protein-muesli.jpg",
    imageUrl: "/images/supplements/muscleblaze-protein-muesli.jpg",
    fallbackImage: "/images/supplements/muscleblaze-protein-muesli.jpg",
    shoppingLinks: [],
    rating: 4.9,
    reviewsCount: 21500,
    price: 10.49,
    originalPrice: 14.99,
    currency: "USD",
    inrPrice: "₹749",
    originalInrPrice: "₹1,049",
    discount: "28% OFF",
    certifications: [
      "25g Protein Per 100g",
      "22% Premium Nuts & Seeds",
      "Zero Added Trans Fat",
      "Labdoor USA Certified"
    ],
    flavorOptions: [
      "Dark Chocolate & Cranberry",
      "Almond & Raisin Delight",
      "High Protein Berry Blast"
    ],
    purpose: "Delivers an instant high-protein, high-crunch breakfast or snack without cooking. Combines fast-acting whey crisps with slow-digesting oats, seeds, and healthy monounsaturated almond fats.",
    commonUsage: "Pour 50g-60g into a bowl with chilled milk, Greek yogurt, or enjoy straight from the bag as high-protein trail mix.",
    timing: "Quick breakfast on rush mornings, intra-day office protein boost, or post-workout crunch.",
    considerations: "Contains natural cocoa and dried fruit sugars. Zero synthetic sweeteners.",
    safetyDisclaimer: "Contains nuts, soy, and gluten.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Choice Award",
        price: "$10.49",
        inrPrice: "₹749",
        url: "https://www.amazon.in/s?k=muscleblaze+high+protein+muesli+dark+chocolate",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Verified",
        price: "$9.99",
        inrPrice: "₹699",
        url: "https://www.cult.fit/store/nutrition/muesli",
        color: "#f97316"
      },
      {
        store: "Nutrabay",
        badge: "Authenticity Guard",
        price: "$10.20",
        inrPrice: "₹720",
        url: "https://nutrabay.com/product-category/muesli",
        color: "#8b5cf6"
      }
    ]
  },
  {
    id: "sup_15",
    name: "Dymatize ISO 100 Hydrolyzed 100% Whey Isolate",
    brand: "Dymatize",
    category: "Protein",
    tagline: "World-renowned award-winning hydrolyzed whey isolate for lightning fast absorption and zero gastrointestinal bloat.",
    image: "/images/supplements/dymatize-iso100-whey.jpg",
    imageUrl: "/images/supplements/dymatize-iso100-whey.jpg",
    fallbackImage: "/images/supplements/dymatize-iso100-whey.jpg",
    shoppingLinks: [],
    rating: 4.9,
    reviewsCount: 26800,
    price: 89.99,
    originalPrice: 109.99,
    currency: "USD",
    inrPrice: "₹7,499",
    originalInrPrice: "₹8,999",
    discount: "17% OFF",
    certifications: [
      "Informed Choice Tested",
      "Hydrolyzed Microfiltration",
      "Gluten Free (<1g Sugar/Fat)",
      "Banned Substance Tested"
    ],
    flavorOptions: [
      "Gourmet Chocolate",
      "Fudge Brownie",
      "Cookies & Cream",
      "Birthday Cake"
    ],
    purpose: "Hydrolyzed whey peptides bypass standard enzymatic breakdown, entering systemic circulation within 20 minutes to trigger maximal mTOR anabolic signaling post-workout.",
    commonUsage: "1 scoop (32g) dissolved effortlessly in 200ml cold water.",
    timing: "Directly post-workout or first thing upon waking during strict cutting/contest preparation phases.",
    considerations: "Virtually zero lactose. Perfect for athletes experiencing digestive sensitivity to regular whey concentrates.",
    safetyDisclaimer: "Dietary supplement for high-performance athletes.",
    buyLinks: [
      {
        store: "Amazon",
        badge: "Global Gold Pick",
        price: "$89.99",
        inrPrice: "₹7,499",
        url: "https://www.amazon.in/s?k=dymatize+iso+100+hydrolyzed+whey",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Verified",
        price: "$86.99",
        inrPrice: "₹7,199",
        url: "https://www.cult.fit/store/nutrition/proteins",
        color: "#f97316"
      },
      {
        store: "iHerb",
        badge: "Official USA Import",
        price: "$88.50",
        inrPrice: "₹7,350",
        url: "https://www.iherb.com/c/dymatize",
        color: "#16a34a"
      }
    ]
  },
  {
    id: "sup_16",
    name: "MyProtein Impact Whey Protein & Flavdrops",
    brand: "MyProtein",
    category: "Protein",
    tagline: "Europe's #1 selling premium whey protein with 21g protein and 4.5g BCAAs sourced from British dairy cows.",
    image: "/images/supplements/whey-protein-isolate.jpg",
    imageUrl: "/images/supplements/whey-protein-isolate.jpg",
    fallbackImage: "/images/supplements/whey-protein-isolate.jpg",
    shoppingLinks: [],
    rating: 4.8,
    reviewsCount: 31200,
    price: 49.99,
    originalPrice: 64.99,
    currency: "USD",
    inrPrice: "₹3,499",
    originalInrPrice: "₹4,499",
    discount: "22% OFF",
    certifications: [
      "Labdoor Grade A Tested",
      "Informed Sport Certified",
      "Grass-Fed British Dairy",
      "Halal & Vegetarian"
    ],
    flavorOptions: [
      "Chocolate Smooth",
      "Salted Caramel",
      "Matcha Green Tea",
      "Natural Vanilla"
    ],
    purpose: "High biological value (BV) protein providing complete amino acid profile to repair torn microfibrils, increase lean dry muscle mass, and prevent muscular breakdown.",
    commonUsage: "1 large scoop (25g) in 250ml water or skim milk 30-60 minutes post-workout.",
    timing: "Post-workout or blended into oats smoothies.",
    considerations: "Mixes instantly with no clumping even without a shaker ball.",
    safetyDisclaimer: "Contains milk and soy lecithin (for effortless solubility).",
    buyLinks: [
      {
        store: "MyProtein",
        badge: "Direct Factory Deals",
        price: "$49.99",
        inrPrice: "₹3,499",
        url: "https://www.myprotein.co.in/nutrition/protein.list",
        color: "#0284c7"
      },
      {
        store: "Amazon",
        badge: "Prime Superfast",
        price: "$51.99",
        inrPrice: "₹3,649",
        url: "https://www.amazon.in/s?k=myprotein+impact+whey",
        color: "#f59e0b"
      },
      {
        store: "Cultstore",
        badge: "Cult Official",
        price: "$50.50",
        inrPrice: "₹3,550",
        url: "https://www.cult.fit/store/nutrition/proteins",
        color: "#f97316"
      }
    ]
  }
];

const stretchingGuide = [
  {
    id: "str_1",
    name: "Standing Hamstring & Calf Sweep",
    targetArea: "Hamstrings, Calves & Lower Back",
    duration: "45 seconds per side",
    instructions: "Extend one leg forward with heel on floor and toes pointed upward. Hinge at hips with straight back, gently sweeping arms down toward foot.",
    completed: true
  },
  {
    id: "str_2",
    name: "Deep Pigeon Pose (Glute Opener)",
    targetArea: "Gluteus Medius & Piriformis",
    duration: "60 seconds per side",
    instructions: "Bring one knee forward behind wrist with shin angled across mat. Slide opposite leg straight back. Sink hips down square to floor.",
    completed: false
  },
  {
    id: "str_3",
    name: "Doorway Pectoral Stretch",
    targetArea: "Chest & Anterior Shoulders",
    duration: "40 seconds per side",
    instructions: "Place forearm against doorway jamb at 90-degree angle. Step through gently until feeling a stretch across chest and shoulder.",
    completed: true
  },
  {
    id: "str_4",
    name: "Cat-Cow Spinal Articulation",
    targetArea: "Thoracic & Lumbar Spine",
    duration: "10 deliberate cycles",
    instructions: "On hands and knees: inhale and arch back, looking upward (cow); exhale and round spine toward ceiling while tucking chin (cat).",
    completed: false
  },
  {
    id: "str_5",
    name: "Kneeling Hip Flexor Lunge with Reach",
    targetArea: "Psoas & Hip Flexors",
    duration: "45 seconds per side",
    instructions: "Step one foot forward into lunge, lower back knee to ground. Tuck pelvis and squeeze glute of rear leg, raising arm on same side overhead.",
    completed: false
  },
  {
    id: "str_6",
    name: "Dead Hang from Pull-Up Bar",
    targetArea: "Latissimus Dorsi & Spinal Decompression",
    duration: "30-45 seconds",
    instructions: "Grip pull-up bar with overhand grip and let body hang relaxed. Breathe deeply into abdomen allowing gravity to decompress vertebrae.",
    completed: false
  }
];

const defaultGymFeePlans = [
  {
    id: "plan_monthly_gym_1",
    gym_id: "gym_1",
    name: "Monthly Strength Tier",
    duration_days: 30,
    billingDuration: "1 Month",
    price: 1499,
    admission_fee: 500,
    discount: "25% Inaugural Offer",
    tax_percent: 18,
    features: [
      "Unlimited Gym Floor & Machine Access",
      "Standard Locker Room & Showers",
      "Free Biomechanics & Posture Assessment",
      "Mobile App Digital QR Access",
      "Free Water Bar Refills"
    ],
    is_active: true,
    is_popular: false,
    badge: "Flexible",
    sort_order: 1,
    updated_at: new Date().toISOString()
  },
  {
    id: "plan_quarterly_gym_1",
    gym_id: "gym_1",
    name: "Quarterly Pro Athlete",
    duration_days: 90,
    billingDuration: "3 Months",
    price: 3999,
    admission_fee: 300,
    discount: "Save ₹500",
    tax_percent: 18,
    features: [
      "All Monthly Tier Inclusions",
      "1 Complimentary Coach Training Session / Month",
      "Infrared Sauna Access (2x / week)",
      "10% Discount at Supplement Pro Shop",
      "Free Body Composition Scanning (InBody)"
    ],
    is_active: true,
    is_popular: true,
    badge: "Most Popular",
    sort_order: 2,
    updated_at: new Date().toISOString()
  },
  {
    id: "plan_half_yearly_gym_1",
    gym_id: "gym_1",
    name: "Half-Yearly Hypertrophy",
    duration_days: 180,
    billingDuration: "6 Months",
    price: 6999,
    admission_fee: 0,
    discount: "Zero Admission Fee",
    tax_percent: 18,
    features: [
      "All Quarterly Tier Inclusions",
      "Chilled Cold Plunge & Steam Suite",
      "Custom Macro & Nutrition Protocol",
      "2 Free Guest Day Passes / Month",
      "Dedicated Permanent Locker Cabin"
    ],
    is_active: true,
    is_popular: false,
    badge: "Best Value",
    sort_order: 3,
    updated_at: new Date().toISOString()
  },
  {
    id: "plan_annual_gym_1",
    gym_id: "gym_1",
    name: "Elite Gold Annual All-Access",
    duration_days: 365,
    billingDuration: "12 Months",
    price: 11999,
    admission_fee: 0,
    discount: "₹3,000 Flat Savings",
    tax_percent: 18,
    features: [
      "VIP Unlimited 24/7 Access to All Gym Zones",
      "Dedicated Strength Coach Guidance & Weekly Form Audits",
      "Unlimited Sauna, Steam & Cold Plunge Suite",
      "Official Fit Health Shaker, Gym Bag & Merch Kit",
      "Priority Olympic Deadlift Platform Booking",
      "Free 30-day Membership Freeze Allowance"
    ],
    is_active: true,
    is_popular: false,
    badge: "VIP Exclusive",
    sort_order: 4,
    updated_at: new Date().toISOString()
  }
];

const defaultGymTerms = {
  gym_1: {
    gym_id: "gym_1",
    is_published: true,
    last_published_at: new Date().toISOString(),
    version: "v2.4",
    version_history: [
      {
        version: "v2.4",
        timestamp: new Date().toISOString(),
        updated_by: "Gym Administrator",
        note: "Published 2026 INR Fee Schedule with GST breakdown and zero admission offer on annual tiers.",
        plan_count: 4
      },
      {
        version: "v2.3",
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_by: "Gym Administrator",
        note: "Added Quarterly Pro Athlete tier with infrared sauna inclusions.",
        plan_count: 4
      }
    ],
    refund_policy: "100% refund is eligible within 7 calendar days of first joining date minus ₹500 administrative setup fee. No refunds are granted after 7 days.",
    freeze_policy: "Memberships of 3 months or greater can be frozen for up to 30 continuous days once per subscription year with 48-hour prior written notice at reception.",
    late_fee_policy: "A 5-day grace period is granted following expiration date. Late renewals beyond grace period incur a ₹200 slot reactivation fee.",
    rules: "1. Personal sweat towel is mandatory on workout floors. 2. Re-rack all plates, dumbbells, and accessories after every set. 3. Lockers are for day-use only. 4. Clean machine touchpoints after use."
  }
};

const defaultMaintenanceDirectory = [
  {
    id: "dir_1",
    name: "Ramesh Sharma",
    category: "Technician",
    companyName: "Matrix Fitness Service Division",
    phone: "+91 98765 11223",
    alternatePhone: "+91 98765 11224",
    email: "ramesh.service@matrixfitness.in",
    address: "Sector 18, Industrial Area, Metro City",
    specialization: "Cable cross-overs, pin-select weight stacks, biomechanical pulley alignment",
    linkedEquipment: ["eq_2", "Dual Adjustable Cable Crossover Column"],
    contractStartDate: "2026-01-01",
    contractEndDate: "2026-12-31",
    serviceFrequency: "Monthly",
    lastServiceDate: "2026-10-01",
    nextServiceDue: "2026-10-12",
    rating: 5,
    notes: "Lead engineer for Matrix gear. Carries authentic aircraft cable replacements in vehicle.",
    isActive: true,
    createdAt: "2026-01-01T09:00:00.000Z",
    updatedAt: "2026-10-01T14:30:00.000Z"
  },
  {
    id: "dir_2",
    name: "Suresh Nair",
    category: "AMC/Service Contract",
    companyName: "Eleiko Nordic Sports AMC",
    phone: "+91 98111 22334",
    alternatePhone: "+91 98111 22335",
    email: "suresh.amc@eleiko.se",
    address: "Eleiko Experience Center, Plot 44, Metro North",
    specialization: "Olympic barbells knurling & sleeve bearings, calibrated powerlifting plates, rubber impact drop platforms",
    linkedEquipment: ["eq_1", "eq_4", "Olympic Flat Bench Press Station (Eleiko 4x)", "Eleiko IWF Olympic Platforms & Barbells (8x)"],
    contractStartDate: "2025-11-05",
    contractEndDate: "2026-11-05",
    serviceFrequency: "Quarterly",
    lastServiceDate: "2026-10-05",
    nextServiceDue: "2026-11-05",
    rating: 5,
    notes: "Annual AMC due for renewal in November (<30 days!). Handles torque inspection and wood insert waxing.",
    isActive: true,
    createdAt: "2025-11-05T09:00:00.000Z",
    updatedAt: "2026-10-05T12:00:00.000Z"
  },
  {
    id: "dir_3",
    name: "Rajiv Malhotra",
    category: "Vendor/Supplier",
    companyName: "Life Fitness Commercial Equipment Depot",
    phone: "+91 98222 33445",
    alternatePhone: "+91 98222 33446",
    email: "rajiv@lifefitness-india.com",
    address: "Warehouse #12, Expressway Logistics Park",
    specialization: "Commercial treadmill drive motors, inverter boards, StairMaster step chains, console motherboards",
    linkedEquipment: ["eq_5", "Commercial Treadmills & StairMasters (6x)"],
    contractStartDate: "2026-01-15",
    contractEndDate: "2026-12-31",
    serviceFrequency: "Bi-Annual",
    lastServiceDate: "2026-10-08",
    nextServiceDue: "2026-10-11",
    rating: 4,
    notes: "Supplies genuine motor belts and console firmware flash tools.",
    isActive: true,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-10-08T16:00:00.000Z"
  },
  {
    id: "dir_4",
    name: "Dr. Anya Lindqvist",
    category: "AMC/Service Contract",
    companyName: "Nordic Cryo & Thermal Systems",
    phone: "+91 98333 44556",
    alternatePhone: "+91 98333 44557",
    email: "support@nordiccryo.eu",
    address: "Suite 502, Horizon Technology Park",
    specialization: "Sub-zero cold plunge chillers (4°C), titanium heat exchangers, ozone sanitization, infrared sauna carbon heaters",
    linkedEquipment: ["eq_6", "Infrared Sauna & Cold Plunge Cryo-Bath (4°C)"],
    contractStartDate: "2026-06-01",
    contractEndDate: "2027-06-01",
    serviceFrequency: "Monthly",
    lastServiceDate: "2026-10-09",
    nextServiceDue: "2026-10-16",
    rating: 5,
    notes: "24/7 priority support for cold plunge chiller loop and infrared sauna heaters.",
    isActive: true,
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-10-09T11:00:00.000Z"
  },
  {
    id: "dir_5",
    name: "Vikram Sethi",
    category: "Emergency Contact",
    companyName: "RapidFix 24/7 Commercial Plumbing & Steam",
    phone: "+91 98444 55667",
    alternatePhone: "+91 98444 55668",
    email: "emergency@rapidfixplumbing.com",
    address: "Shop 14, Main Market, Downtown Metro",
    specialization: "High-pressure locker showers, steam room boilers, cold plunge drainage pumps, backflow valves",
    linkedEquipment: [],
    contractStartDate: "",
    contractEndDate: "",
    serviceFrequency: "On-Call",
    lastServiceDate: "2026-09-15",
    nextServiceDue: "2026-11-15",
    rating: 5,
    notes: "Available 24/7 for locker room flooding or steam room steam boiler pressure drops.",
    isActive: true,
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-09-15T15:00:00.000Z"
  },
  {
    id: "dir_6",
    name: "Harish Verma",
    category: "Technician",
    companyName: "VoltSafe Industrial Electricians",
    phone: "+91 98555 66778",
    alternatePhone: "+91 98555 66779",
    email: "harish@voltsafe.in",
    address: "B-29, Phase 2, Industrial Estate",
    specialization: "Three-phase commercial power, gym floor DB panels, cardio surge protectors, backup generator link",
    linkedEquipment: ["eq_5"],
    contractStartDate: "2026-01-01",
    contractEndDate: "2026-12-31",
    serviceFrequency: "Quarterly",
    lastServiceDate: "2026-08-20",
    nextServiceDue: "2026-10-05",
    rating: 4,
    notes: "Overdue for quarterly load balancing inspection across cardio treadmill bank.",
    isActive: true,
    createdAt: "2026-01-01T09:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z"
  },
  {
    id: "dir_7",
    name: "Meenakshi Devi",
    category: "Cleaning/Housekeeping",
    companyName: "CleanPro Facility Hygiene Solutions",
    phone: "+91 98666 77889",
    alternatePhone: "+91 98666 77890",
    email: "ops@cleanproindia.com",
    address: "Corporate Towers, 3rd Floor, Central Avenue",
    specialization: "Hospital-grade rubber floor sanitization, vinyl bench upholstery disinfection, sweat barrier treatments, chalk air filtration",
    linkedEquipment: ["eq_1", "eq_2", "eq_3", "eq_4", "eq_5", "eq_6"],
    contractStartDate: "2026-01-01",
    contractEndDate: "2026-12-31",
    serviceFrequency: "Daily",
    lastServiceDate: "2026-10-09",
    nextServiceDue: "2026-10-10",
    rating: 5,
    notes: "Provides 4 full-time floor sanitation crew members on rolling shifts.",
    isActive: true,
    createdAt: "2026-01-01T06:00:00.000Z",
    updatedAt: "2026-10-09T18:00:00.000Z"
  },
  {
    id: "dir_8",
    name: "Balwant Singh",
    category: "Vendor/Supplier",
    companyName: "SteelGrip Upholstery & Custom Gym Pads",
    phone: "+91 98777 88990",
    alternatePhone: "+91 98777 88991",
    email: "balwant@steelgrip.in",
    address: "Khasra 410, Artisan Hub, East Sector",
    specialization: "Heavy-duty 1000D vinyl pad re-covering, high-density foam injection, custom embroidered gym logo bench pads",
    linkedEquipment: ["eq_1", "eq_3", "Olympic Flat Bench Press Station (Eleiko 4x)", "45-Degree Heavy Duty Leg Press & Hack Squat"],
    contractStartDate: "",
    contractEndDate: "",
    serviceFrequency: "On-Call",
    lastServiceDate: "2026-09-10",
    nextServiceDue: "2026-12-01",
    rating: 5,
    notes: "Custom re-upholstery within 24-hour turnaround for torn bench pads.",
    isActive: true,
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-09-10T11:00:00.000Z"
  }
];

const defaultAdminNotes = [
  {
    id: "note_1",
    title: "Q4 Preventive Maintenance & Cable Replacement Cycle",
    body: "Technician Ramesh (Matrix Fitness) is arriving Saturday 10:00 AM for Cable Crossover Station left pulley replacement. Ensure Zone C is roped off for 45 minutes and spare aircraft cable is handed over from inventory storage. Confirm tension calibration before opening zone to members.",
    category: "Maintenance",
    isPinned: true,
    colorLabel: "amber",
    reminderDate: "2026-10-12T10:00:00.000Z",
    isPrivateToMe: false,
    createdBy: {
      id: "user_admin_001",
      name: "Coach Marcus Vance",
      email: "admin@example.com",
      role: "admin"
    },
    linkedDirectoryId: "dir_1",
    linkedEquipmentId: "eq_2",
    attachments: ["matrix_cable_diagram.pdf"],
    isActive: true,
    createdAt: "2026-10-08T15:00:00.000Z",
    updatedAt: "2026-10-08T15:00:00.000Z"
  },
  {
    id: "note_2",
    title: "Front Desk Cash Verification & Due Date Reconciliation Audit",
    body: "Audit of all receipt vouchers generated this month shows 100% synchronization with admin collaboration PIN 778899. Cash register reconciles at ₹1,245,000 without any variance. Next quarterly audit scheduled for Nov 1st. Ensure desk staff logs all manual cash overrides.",
    category: "Finance",
    isPinned: true,
    colorLabel: "emerald",
    reminderDate: "2026-11-01T09:00:00.000Z",
    isPrivateToMe: false,
    createdBy: {
      id: "user_admin_001",
      name: "Coach Marcus Vance",
      email: "admin@example.com",
      role: "admin"
    },
    linkedDirectoryId: "",
    linkedEquipmentId: "",
    attachments: [],
    isActive: true,
    createdAt: "2026-10-09T14:00:00.000Z",
    updatedAt: "2026-10-09T14:00:00.000Z"
  },
  {
    id: "note_3",
    title: "Nordic Cryo Chiller Ozone Filter & AMC Renewal",
    body: "Nordic Cryo Care AMC contract expires on Nov 5th (within 30 days). Contact Dr. Anya Lindqvist to negotiate multi-facility renewal discount. Also schedule ozone diffuser backwash on Tuesday morning before 6:00 AM opening.",
    category: "Reminders",
    isPinned: false,
    colorLabel: "cyan",
    reminderDate: "2026-10-16T06:00:00.000Z",
    isPrivateToMe: false,
    createdBy: {
      id: "user_admin_001",
      name: "Coach Marcus Vance",
      email: "admin@example.com",
      role: "admin"
    },
    linkedDirectoryId: "dir_4",
    linkedEquipmentId: "eq_6",
    attachments: [],
    isActive: true,
    createdAt: "2026-10-07T11:00:00.000Z",
    updatedAt: "2026-10-07T11:00:00.000Z"
  },
  {
    id: "note_4",
    title: "Confidential VIP Athlete Remarks: Member Athlete",
    body: "Member Member Athlete (FH-MEM-7829) is prepping for national Olympic powerlifting trials in December. Coach Elena is overseeing squat depth and recovery sauna sessions. Ensure chalk bowl is fully topped up at Platform #2 and reserve 20kg calibrated Eleiko bumper pairs.",
    category: "Members",
    isPinned: false,
    colorLabel: "violet",
    reminderDate: "2026-10-20T17:00:00.000Z",
    isPrivateToMe: true,
    createdBy: {
      id: "user_admin_001",
      name: "Coach Marcus Vance",
      email: "admin@example.com",
      role: "admin"
    },
    linkedDirectoryId: "",
    linkedEquipmentId: "eq_4",
    attachments: [],
    isActive: true,
    createdAt: "2026-10-06T16:00:00.000Z",
    updatedAt: "2026-10-06T16:00:00.000Z"
  },
  {
    id: "note_5",
    title: "Air Conditioning Duct Deep Clean & Locker Steam Boiler Check",
    body: "CleanPro hygiene crew will perform nocturnal deep cleaning of locker showers and AC intake vents on Sunday night (11:30 PM - 3:30 AM). RapidFix plumbing team on standby for boiler descaling. Issue temporary facility access passes.",
    category: "General",
    isPinned: false,
    colorLabel: "rose",
    reminderDate: "2026-10-11T23:30:00.000Z",
    isPrivateToMe: false,
    createdBy: {
      id: "user_admin_001",
      name: "Coach Marcus Vance",
      email: "admin@example.com",
      role: "admin"
    },
    linkedDirectoryId: "dir_7",
    linkedEquipmentId: "",
    attachments: [],
    isActive: true,
    createdAt: "2026-10-05T13:00:00.000Z",
    updatedAt: "2026-10-05T13:00:00.000Z"
  }
];

module.exports = {
  initialGyms,
  defaultSplitWorkouts,
  foodDatabase,
  supplementCatalog,
  stretchingGuide,
  defaultGymFeePlans,
  defaultGymTerms,
  defaultMaintenanceDirectory,
  defaultAdminNotes
};

