const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const {
  initialGyms,
  defaultSplitWorkouts,
  foodDatabase,
  supplementCatalog,
  stretchingGuide,
  defaultGymFeePlans,
  defaultGymTerms,
  defaultMaintenanceDirectory,
  defaultAdminNotes
} = require('./seedData');
const { getFirestore, isFirebaseActive } = require('../config/firebase');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const BUNDLED_DB_FILE = path.join(__dirname, 'fit_health_store.json');
const DB_FILE = isServerless ? path.join('/tmp', 'fit_health_store.json') : BUNDLED_DB_FILE;

class JSONDatabase {
  constructor() {
    this.data = {
      users: [],
      gyms: [],
      workoutPlans: [],
      dietPlans: [],
      vitalsLogs: [],
      supplements: [],
      progressRecords: [],
      hydrationLogs: [],
      dayPassBookings: [],
      foodItems: [],
      gymMembers: [],
      gymCheckIns: [],
      gymEquipment: [],
      gymFeePlans: [],
      gymTerms: {},
      cashPaymentTokens: [],
      membershipTransactions: [],
      maintenanceDirectory: [],
      adminNotes: [],
      adminAuditLogs: [],
      biometrics: [],
      biometricsConsent: [],
      providerConnections: [],
      otps: []
    };
    this.init();
  }


  init() {
    try {
      // In serverless (e.g. Vercel), copy bundled store to writable /tmp directory if needed
      if (isServerless && !fs.existsSync(DB_FILE) && fs.existsSync(BUNDLED_DB_FILE)) {
        try {
          fs.copyFileSync(BUNDLED_DB_FILE, DB_FILE);
        } catch (_) {}
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
        this.ensureAdminAndGymData();
        this.save();
      } else if (fs.existsSync(BUNDLED_DB_FILE)) {
        const fileContent = fs.readFileSync(BUNDLED_DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
        this.ensureAdminAndGymData();
        this.save();
      } else {
        this.seedInitialData();
        this.ensureAdminAndGymData();
        this.save();
      }
    } catch (err) {
      console.error('[JSONDatabase] Failed to read database file, re-initializing...', err);
      this.seedInitialData();
      this.ensureAdminAndGymData();
      this.save();
    }
  }

  ensureAdminAndGymData() {
    if (!this.data.users) this.data.users = [];
    if (!this.data.biometrics) this.data.biometrics = [];
    if (!this.data.biometricsConsent) this.data.biometricsConsent = [];
    if (!this.data.providerConnections) this.data.providerConnections = [];
    if (!this.data.otps) this.data.otps = [];

    // Always keep gyms collection initialized if empty, but preserve customizations
    if (!this.data.gyms || this.data.gyms.length === 0) {
      this.data.gyms = JSON.parse(JSON.stringify(initialGyms));
    } else {
      // Ensure all gyms have INR currency and required fields
      this.data.gyms = this.data.gyms.map(g => ({
        ...g,
        currency: 'INR'
      }));
    }

    // Ensure supplements collection has all 16 items including Peanut Butter, Oats, Muesli and top brands
    if (!this.data.supplements || this.data.supplements.length < supplementCatalog.length) {
      this.data.supplements = JSON.parse(JSON.stringify(supplementCatalog));
    } else {
      for (const catItem of supplementCatalog) {
        const idx = this.data.supplements.findIndex(s => s.id === catItem.id);
        if (idx === -1) {
          this.data.supplements.push(JSON.parse(JSON.stringify(catItem)));
        } else {
          this.data.supplements[idx] = { ...catItem, ...this.data.supplements[idx] };
        }
      }
    }

    const activeGym = this.data.gyms[0] || { name: 'rsv gym and sports club', address: '442 Fitness Boulevard, Downtown Metro' };

    // Ensure all gym members have distinct 4-digit checkInPin
    if (this.data.gymMembers && this.data.gymMembers.length > 0) {
      this.data.gymMembers = this.data.gymMembers.map((m, i) => {
        const pinFromId = (m.membershipId || '').split('-').pop() || '';
        const validPin = /^\d{4}$/.test(pinFromId) ? pinFromId : String(7820 + i);
        return {
          ...m,
          checkInPin: m.checkInPin || validPin,
          temporaryPassword: m.temporaryPassword || m.initialPassword || `Fit@${validPin}`,
          initialPassword: m.initialPassword || m.temporaryPassword || `Fit@${validPin}`
        };
      });
    }

    // Always keep supplements synced with enriched INR catalog
    this.data.supplements = [...supplementCatalog];

    // Ensure gym fee plans collection exists with enriched schema & gym_id
    if (!this.data.gymFeePlans || this.data.gymFeePlans.length === 0) {
      this.data.gymFeePlans = JSON.parse(JSON.stringify(defaultGymFeePlans));
    } else {
      // Ensure all fee plans have required schema fields
      this.data.gymFeePlans = this.data.gymFeePlans
        .filter(p => p.id !== 'plan_day_pass' && !p.name?.toLowerCase().includes('day pass'))
        .map((p, idx) => ({
          id: p.id || `plan_${idx + 1}_gym_1`,
          gym_id: p.gym_id || "gym_1",
          name: p.name || "Standard Membership",
          duration_days: p.duration_days || (p.durationMonths ? p.durationMonths * 30 : 30),
          billingDuration: p.billingDuration || p.durationLabel || `${p.durationMonths || 1} Month(s)`,
          price: Number(p.price) || 1499,
          admission_fee: p.admission_fee !== undefined ? Number(p.admission_fee) : 0,
          discount: p.discount || "",
          tax_percent: p.tax_percent !== undefined ? Number(p.tax_percent) : 18,
          features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? p.features.split(',').map(s => s.trim()) : ["Full Gym Access"]),
          is_active: p.is_active !== undefined ? p.is_active : (p.active !== undefined ? p.active : true),
          is_popular: p.is_popular !== undefined ? p.is_popular : (p.popular !== undefined ? p.popular : false),
          badge: p.badge || (p.popular ? "Most Popular" : ""),
          sort_order: p.sort_order || (idx + 1),
          updated_at: p.updated_at || new Date().toISOString()
        }));
    }

    // Ensure gymTerms collection exists
    if (!this.data.gymTerms || Object.keys(this.data.gymTerms).length === 0) {
      this.data.gymTerms = JSON.parse(JSON.stringify(defaultGymTerms));
    }

    // Ensure membershipTransactions collection exists
    if (!this.data.membershipTransactions || this.data.membershipTransactions.length === 0) {
      this.data.membershipTransactions = [
        {
          id: "txn_101",
          receiptNumber: "REC-2026-7829",
          userId: "member_initial",
          memberId: "mem_101",
          memberName: "Member Athlete",
          memberEmail: "member@example.com",
          gymId: "gym_1",
          gymName: activeGym.name,
          planId: "plan_annual_gym_1",
          planName: "Elite Gold Annual All-Access",
          durationDays: 365,
          durationLabel: "12 Months",
          basePrice: 11999,
          admissionFee: 0,
          discountAmount: 0,
          taxPercent: 18,
          taxAmount: 2159.82,
          totalAmount: 11999,
          amountPaid: 11999,
          amountDue: 0,
          paymentMode: "Online UPI (GPay)",
          paymentStatus: "Paid",
          transactionDate: "2026-01-15T10:30:00.000Z",
          expiryDate: "2027-01-15",
          issuedBy: "Automated Gateway",
          notes: "Annual All-Access Membership with VIP privileges."
        }
      ];
    }

    // Ensure cash payment desk tokens collection exists
    if (!this.data.cashPaymentTokens || this.data.cashPaymentTokens.length === 0) {
      this.data.cashPaymentTokens = [
        {
          id: "token_101",
          tokenCode: "CASH-DESK-7829",
          userId: "member_initial",
          memberName: "Member Athlete",
          planId: "plan_quarterly_gym_1",
          planName: "Quarterly Pro Athlete (3 Months)",
          amount: 3999,
          gymId: "gym_1",
          gymName: activeGym.name,
          paymentMode: "Cash at Desk",
          status: "Pending Desk Verification",
          generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          instructions: "Present this voucher code at reception desk to pay cash and activate membership."
        }
      ];
    }


    // Ensure gymMembers collection exists
    if (!this.data.gymMembers || this.data.gymMembers.length === 0) {
      this.data.gymMembers = [
        {
          id: "mem_101",
          name: "Member Athlete",
          email: "member@example.com",
          phone: "+1 (555) 987-6543",
          membershipId: "FH-MEM-7829",
          plan: "Elite Gold Annual",
          status: "Active",
          joinedDate: "2026-01-15",
          expiryDate: "2027-01-15",
          checkInsThisMonth: 18,
          lastCheckIn: "Today, 07:15 AM",
          assignedTrainer: "Coach Marcus Vance",
          notes: "Consistent morning lifter, PPL split"
        },
        {
          id: "mem_102",
          name: "Sarah Connor",
          email: "sarah.c@ironmail.io",
          phone: "+1 (555) 432-1098",
          membershipId: "FH-MEM-8104",
          plan: "Strength & Conditioning Pro",
          status: "Active",
          joinedDate: "2026-02-01",
          expiryDate: "2027-02-01",
          checkInsThisMonth: 22,
          lastCheckIn: "Today, 08:30 AM",
          assignedTrainer: "Elena Rostova",
          notes: "Powerlifting prep"
        },
        {
          id: "mem_103",
          name: "David Chen",
          email: "david.chen@finfit.com",
          phone: "+1 (555) 321-6547",
          membershipId: "FH-MEM-6492",
          plan: "Monthly Flex Pass",
          status: "Active",
          joinedDate: "2026-03-10",
          expiryDate: "2026-10-28",
          checkInsThisMonth: 12,
          lastCheckIn: "Yesterday, 06:45 PM",
          assignedTrainer: "None",
          notes: "Cardio & functional turf focus"
        },
        {
          id: "mem_104",
          name: "Elena Rostova",
          email: "elena.r@athletics.org",
          phone: "+1 (555) 654-7890",
          membershipId: "FH-MEM-5321",
          plan: "VIP Black Tier",
          status: "Active",
          joinedDate: "2025-11-20",
          expiryDate: "2026-11-20",
          checkInsThisMonth: 25,
          lastCheckIn: "Today, 09:00 AM",
          assignedTrainer: "Self (Certified Coach)",
          notes: "Olympic weightlifting specialist"
        },
        {
          id: "mem_105",
          name: "Michael Sterling",
          email: "m.sterling@businesscorp.com",
          phone: "+1 (555) 789-0123",
          membershipId: "FH-MEM-9921",
          plan: "Corporate Executive Plan",
          status: "Frozen",
          joinedDate: "2026-01-05",
          expiryDate: "2026-12-05",
          checkInsThisMonth: 2,
          lastCheckIn: "2 weeks ago",
          assignedTrainer: "Coach Marcus Vance",
          notes: "Requested 1-month travel pause"
        },
        {
          id: "mem_106",
          name: "Jessica Hayes",
          email: "jess.hayes@fitlifestyle.io",
          phone: "+1 (555) 890-1234",
          membershipId: "FH-MEM-4112",
          plan: "Standard Monthly",
          status: "Expired",
          joinedDate: "2026-07-01",
          expiryDate: "2026-09-30",
          checkInsThisMonth: 0,
          lastCheckIn: "Sep 28, 2026",
          assignedTrainer: "None",
          notes: "Renewal notice sent via email"
        }
      ];
    }

    // Ensure gymCheckIns collection exists
    if (!this.data.gymCheckIns || this.data.gymCheckIns.length === 0) {
      this.data.gymCheckIns = [
        { id: "chk_1", memberName: "Member Athlete", membershipId: "FH-MEM-7829", time: "07:15 AM", type: "Member Check-in", status: "Approved" },
        { id: "chk_2", memberName: "Sarah Connor", membershipId: "FH-MEM-8104", time: "08:30 AM", type: "Member Check-in", status: "Approved" },
        { id: "chk_3", memberName: "Elena Rostova", membershipId: "FH-MEM-5321", time: "09:00 AM", type: "Member Check-in", status: "Approved" },
        { id: "chk_4", memberName: "Liam Vance", membershipId: "PASS-9021", time: "10:15 AM", type: "Day Pass (₹299)", status: "Paid & Verified" },
        { id: "chk_5", memberName: "Sophia Zhang", membershipId: "PASS-9022", time: "11:40 AM", type: "Day Pass (₹299)", status: "Paid & Verified" }
      ];
    }

    // Ensure gymEquipment collection exists with comprehensive maintenance tracking
    if (!this.data.gymEquipment || this.data.gymEquipment.length === 0 || !this.data.gymEquipment[0].brand) {
      this.data.gymEquipment = [
        {
          id: "eq_1",
          name: "Olympic Flat Bench Press Station (Eleiko 4x)",
          zone: "Zone A • Free Weights (East Bay)",
          brand: "Eleiko / Hammer Strength",
          serialNumber: "ELK-2024-BP08",
          condition: "Excellent",
          status: "Operational",
          lastInspection: "2026-10-05",
          nextDue: "2026-11-05",
          technicianNotes: "Pads sanitized, J-cups greased, bolts tightened.",
          qrAssetTag: "EQ-AST-0101",
          serviceLogs: [
            { date: "2026-10-05", technician: "Suresh (Eleiko Certified)", action: "Full safety torque inspection & pad sanitization" }
          ]
        },
        {
          id: "eq_2",
          name: "Dual Adjustable Cable Crossover Column",
          zone: "Zone C • Cable Station #4",
          brand: "Matrix Fitness",
          serialNumber: "MTX-CBL-4491",
          condition: "Needs Maintenance",
          status: "Service Scheduled",
          lastInspection: "2026-10-01",
          nextDue: "2026-10-12",
          technicianNotes: "Left pulley cable showing minor fraying. Replacement aircraft cable ordered from Matrix distributor.",
          qrAssetTag: "EQ-AST-0102",
          serviceLogs: [
            { date: "2026-10-01", technician: "Ramesh Sharma", action: "Pulleys lubricated, cable replacement scheduled" }
          ]
        },
        {
          id: "eq_3",
          name: "45-Degree Heavy Duty Leg Press & Hack Squat",
          zone: "Zone D • Plate-Loaded Arena",
          brand: "Hammer Strength",
          serialNumber: "HS-LP-7782",
          condition: "Excellent",
          status: "Operational",
          lastInspection: "2026-09-28",
          nextDue: "2026-10-28",
          technicianNotes: "Linear bearings inspected & greased. Safety locks operational.",
          qrAssetTag: "EQ-AST-0103",
          serviceLogs: [
            { date: "2026-09-28", technician: "Vikram Kumar", action: "Bearing lubrication and guide rod polish" }
          ]
        },
        {
          id: "eq_4",
          name: "Eleiko IWF Olympic Platforms & Barbells (8x)",
          zone: "Zone A • Olympic Platforms",
          brand: "Eleiko Sweden",
          serialNumber: "ELK-PLT-9921",
          condition: "Excellent",
          status: "Operational",
          lastInspection: "2026-10-03",
          nextDue: "2026-11-03",
          technicianNotes: "Chalk cleaned from knurling, needle bearings spin freely, wooden inserts waxed.",
          qrAssetTag: "EQ-AST-0104",
          serviceLogs: [
            { date: "2026-10-03", technician: "Suresh (Eleiko)", action: "Sleeve cleaning & bearing oil application" }
          ]
        },
        {
          id: "eq_5",
          name: "Commercial Treadmills & StairMasters (6x)",
          zone: "Zone E • Cardio Loft",
          brand: "Life Fitness / Matrix",
          serialNumber: "LF-CRD-3309",
          condition: "Under Repair",
          status: "Under Repair",
          lastInspection: "2026-10-08",
          nextDue: "2026-10-11",
          technicianNotes: "Treadmill #3 motor drive belt alignment required. Technician visiting Saturday.",
          qrAssetTag: "EQ-AST-0105",
          serviceLogs: [
            { date: "2026-10-08", technician: "Life Fitness Service Rep", action: "Diagnostic error code E-04 resolved, drive belt on order" }
          ]
        },
        {
          id: "eq_6",
          name: "Infrared Sauna & Cold Plunge Cryo-Bath (4°C)",
          zone: "Zone F • Recovery Suite",
          brand: "Nordic Cryo",
          serialNumber: "NC-RCV-8812",
          condition: "Optimal",
          status: "Operational",
          lastInspection: "2026-10-09",
          nextDue: "2026-10-16",
          technicianNotes: "Water ozone filtration active. Temperature maintained @ 4.2°C. Sauna heaters checked.",
          qrAssetTag: "EQ-AST-0106",
          serviceLogs: [
            { date: "2026-10-09", technician: "Internal Staff (Daily Log)", action: "Filter backwash & temperature calibration check" }
          ]
        }
      ];
    }

    // Ensure maintenanceDirectory collection exists
    if (!this.data.maintenanceDirectory || this.data.maintenanceDirectory.length === 0) {
      this.data.maintenanceDirectory = JSON.parse(JSON.stringify(defaultMaintenanceDirectory));
    }

    // Ensure adminNotes collection exists (Admin-Only Confidential Notes & Sentences - blank by default)
    if (!this.data.adminNotes) {
      this.data.adminNotes = [];
    }

    // Ensure adminAuditLogs exists
    if (!this.data.adminAuditLogs) {
      this.data.adminAuditLogs = [];
    }

    // Ensure workout plans are synced with the 6-Day Visual Blueprint
    if (!this.data.workoutPlans || this.data.workoutPlans.length === 0 || !this.data.workoutPlans[0].posterImage) {
      this.data.workoutPlans = [
        {
          id: "plan_demo_1",
          userId: "member_initial",
          goal: "Bulking",
          splitName: "6-Day Visual Workout Blueprint: Focus • Train • Transform",
          posterImage: "/images/6_day_workout_plan.jpg",
          motto: "DISCIPLINE TODAY, RESULTS TOMORROW.",
          disciplines: [
            { icon: "Arm", title: "STAY CONSISTENT", desc: "Consistency is the key to see results." },
            { icon: "Utensils", title: "EAT CLEAN", desc: "Eat enough protein & healthy foods to fuel your body." },
            { icon: "Droplets", title: "STAY HYDRATED", desc: "Drink plenty of water throughout the day." },
            { icon: "Bed", title: "GET ENOUGH SLEEP", desc: "7-8 hours of sleep is essential for muscle recovery." }
          ],
          activeDayIndex: 0,
          days: defaultSplitWorkouts.bulking,
          history: [
            {
              date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              dayName: "Day 6 — LEGS",
              durationMinutes: 52,
              exercisesCompleted: 5,
              totalVolumeKg: 8420
            },
            {
              date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0],
              dayName: "Day 5 — BACK",
              durationMinutes: 58,
              exercisesCompleted: 5,
              totalVolumeKg: 7850
            }
          ]
        }
      ];
    }
  }

  seedInitialData() {
    console.log('[JSONDatabase] Seeding initial fitness data...');
    this.data.gyms = [...initialGyms];
    this.data.supplements = [...supplementCatalog];
    this.data.foodItems = [...foodDatabase];

    // Seed Demo User: Member Athlete
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const demoUser = {
      id: "member_initial",
      name: "Member Athlete",
      email: "member@example.com",
      password: hashedPassword,
      phone: "+1 (555) 987-6543",
      age: 24,
      gender: "Male",
      height: 180, // cm
      weight: 78.5, // kg
      targetWeight: 84.0, // kg
      fitnessLevel: "Intermediate",
      primaryGoal: "Bulking", // Bulking | Cutting | Maintenance | General fitness
      activityLevel: "Moderately Active (3-5 days/week)",
      dietaryPreference: "High Protein Non-Veg",
      workoutExperience: "2-3 Years",
      targetCalories: 2850,
      targetProtein: 165,
      targetCarbs: 340,
      targetFat: 75,
      waterTargetLiters: 3.5,
      sleepTargetHours: 8.0,
      streak: 14,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users = [demoUser];

    // Seed Active Workout Plan for Demo User
    this.data.workoutPlans = [
      {
        id: "plan_demo_1",
        userId: "member_initial",
        goal: "Bulking",
        splitName: "6-Day Hypertrophy Push-Pull-Legs Split",
        activeDayIndex: 0, // Day 1
        days: defaultSplitWorkouts.bulking,
        history: [
          {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dayName: "Day 6 — Arms + Core",
            durationMinutes: 52,
            exercisesCompleted: 5,
            totalVolumeKg: 6420
          },
          {
            date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0],
            dayName: "Day 5 — Chest + Back",
            durationMinutes: 58,
            exercisesCompleted: 4,
            totalVolumeKg: 7850
          }
        ]
      }
    ];

    // Seed Today's Meals for Demo User
    const todayStr = new Date().toISOString().split('T')[0];
    this.data.dietPlans = [
      {
        id: "diet_demo_1",
        userId: "member_initial",
        date: todayStr,
        meals: [
          {
            id: "meal_1",
            category: "Breakfast",
            name: "Oatmeal with Whey & Peanut Butter",
            calories: 540,
            protein: 36,
            carbs: 58,
            fat: 18,
            fiber: 8,
            loggedAt: "08:15 AM"
          },
          {
            id: "meal_2",
            category: "Lunch",
            name: "Grilled Chicken Breast with Brown Rice & Broccoli",
            calories: 620,
            protein: 52,
            carbs: 65,
            fat: 14,
            fiber: 7,
            loggedAt: "01:30 PM"
          },
          {
            id: "meal_3",
            category: "Snacks",
            name: "Greek Yogurt with Blueberries & Almonds",
            calories: 330,
            protein: 24,
            carbs: 22,
            fat: 16,
            fiber: 5,
            loggedAt: "04:45 PM"
          }
        ]
      }
    ];

    // Seed Hydration
    this.data.hydrationLogs = [
      {
        id: "hyd_demo_1",
        userId: "member_initial",
        date: todayStr,
        consumedLiters: 2.25,
        targetLiters: 3.5,
        logs: [
          { time: "08:30 AM", amountMl: 500 },
          { time: "11:00 AM", amountMl: 500 },
          { time: "01:45 PM", amountMl: 500 },
          { time: "04:30 PM", amountMl: 750 }
        ]
      }
    ];

    // Seed Vitals Logs
    this.data.vitalsLogs = [
      {
        id: "vit_demo_1",
        userId: "member_initial",
        date: todayStr,
        heartRateBpm: 68,
        restingHeartRate: 58,
        maxHeartRate: 154,
        steps: 8420,
        stepGoal: 10000,
        activeCaloriesBurned: 520,
        sleepHours: 7.6,
        sleepTargetHours: 8.0,
        recoveryScore: 88, // 0 - 100
        syncSource: "Google Fit Sync",
        isWearableConnected: true,
        wearableDevice: "Fitbit Sense 2 / Google Fit",
        lastSyncTimestamp: new Date().toISOString(),
        cardioZones: {
          warmUpMinutes: 20,
          fatBurnMinutes: 35,
          cardioMinutes: 25,
          peakMinutes: 12
        }
      }
    ];

    // Seed Progress Records (Historical Weight & Measurements)
    this.data.progressRecords = [
      {
        id: "prog_demo_1",
        userId: "member_initial",
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weightKg: 76.8,
        chestCm: 101,
        armsCm: 37.0,
        waistCm: 81.5,
        thighsCm: 56.5,
        benchPressKg: 75,
        squatKg: 100,
        deadliftKg: 120,
        notes: "Starting bulking phase week 1"
      },
      {
        id: "prog_demo_2",
        userId: "member_initial",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weightKg: 77.4,
        chestCm: 102,
        armsCm: 37.5,
        waistCm: 82.0,
        thighsCm: 57.0,
        benchPressKg: 77.5,
        squatKg: 105,
        deadliftKg: 125,
        notes: "Gaining steadily. Recovery feels great."
      },
      {
        id: "prog_demo_3",
        userId: "member_initial",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weightKg: 78.0,
        chestCm: 103,
        armsCm: 38.0,
        waistCm: 82.2,
        thighsCm: 57.8,
        benchPressKg: 80,
        squatKg: 110,
        deadliftKg: 130,
        notes: "Hit 80kg bench press for 6 reps!"
      },
      {
        id: "prog_demo_4",
        userId: "member_initial",
        date: todayStr,
        weightKg: 78.5,
        chestCm: 103.5,
        armsCm: 38.4,
        waistCm: 82.5,
        thighsCm: 58.2,
        benchPressKg: 82.5,
        squatKg: 112.5,
        deadliftKg: 135,
        notes: "Energy peak. Bulking protocol on point."
      }
    ];

    // Seed Stretching Guide state
    this.data.stretchingState = {
      userId: "member_initial",
      stretches: [...stretchingGuide],
      lastCompletedAt: todayStr
    };
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[JSONDatabase] Failed to write database file:', err);
    }
  }

  // --- Collection Query Helpers ---
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collectionName, filterFn = null) {
    const col = this.getCollection(collectionName);
    if (!filterFn) return [...col];
    return col.filter(filterFn);
  }

  findOne(collectionName, filterFn) {
    const col = this.getCollection(collectionName);
    return col.find(filterFn) || null;
  }

  findById(collectionName, id) {
    if (!id) return null;
    const col = this.getCollection(collectionName);
    return col.find(item => item.id === id || item._id === id || item.userId === id) || null;
  }

  create(collectionName, record) {
    const col = this.getCollection(collectionName);
    const newRecord = {
      id: record.id || `${collectionName.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...record
    };
    col.push(newRecord);
    this.save();

    // Async sync to Cloud Firestore when configured
    if (isFirebaseActive()) {
      try {
        const firestore = getFirestore();
        firestore.collection(collectionName).doc(String(newRecord.id)).set(JSON.parse(JSON.stringify(newRecord)), { merge: true }).catch(err => {
          console.warn(`[Firestore Sync] Failed to sync document to ${collectionName}:`, err.message);
        });
      } catch (_) { }
    }

    return newRecord;
  }

  update(collectionName, idOrPredicate, updates) {
    const col = this.getCollection(collectionName);
    const index = typeof idOrPredicate === 'function'
      ? col.findIndex(idOrPredicate)
      : col.findIndex(item => item.id === idOrPredicate || item._id === idOrPredicate || item.userId === idOrPredicate);
    if (index === -1) return null;

    col[index] = {
      ...col[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();

    // Async sync to Cloud Firestore when configured
    if (isFirebaseActive() && col[index].id) {
      try {
        const firestore = getFirestore();
        firestore.collection(collectionName).doc(String(col[index].id)).set(JSON.parse(JSON.stringify(col[index])), { merge: true }).catch(err => {
          console.warn(`[Firestore Sync] Failed to update document in ${collectionName}:`, err.message);
        });
      } catch (_) { }
    }

    return col[index];
  }

  delete(collectionName, idOrPredicate) {
    const col = this.getCollection(collectionName);
    const index = typeof idOrPredicate === 'function'
      ? col.findIndex(idOrPredicate)
      : col.findIndex(item => item.id === idOrPredicate || item._id === idOrPredicate || item.userId === idOrPredicate);
    if (index === -1) return false;

    const removedItem = col.splice(index, 1)[0];
    this.save();

    // Async sync to Cloud Firestore when configured
    if (isFirebaseActive() && removedItem && removedItem.id) {
      try {
        const firestore = getFirestore();
        firestore.collection(collectionName).doc(String(removedItem.id)).delete().catch(err => {
          console.warn(`[Firestore Sync] Failed to delete document in ${collectionName}:`, err.message);
        });
      } catch (_) { }
    }

    return true;
  }
}

const db = new JSONDatabase();

module.exports = db;
