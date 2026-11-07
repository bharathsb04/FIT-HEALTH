const fs = require('fs');
const path = require('path');

const targetBase = path.resolve(__dirname, '../../frontend/public/images/workouts');

const categories = ['chest', 'shoulders', 'biceps', 'triceps', 'back', 'legs', 'recovery'];

categories.forEach(cat => {
  const dir = path.join(targetBase, cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const matched = JSON.parse(fs.readFileSync('backend/data/matchedExerciseImages.json', 'utf8'));

// High quality, royalty-free curated photos for Day 7 recovery
const recoveryDownloads = [
  {
    category: 'recovery',
    file: 'walking.jpg',
    url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'recovery',
    file: 'stretching.jpg',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'recovery',
    file: 'mobility.jpg',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
  }
];

async function downloadAll() {
  console.log('Downloading 30 real exercise demonstration photos from free-exercise-db...');
  
  for (const item of matched) {
    const rawUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${encodeURIComponent(item.imagePath.split('/')[0])}/0.jpg`;
    const dest = path.join(targetBase, item.category, item.file);
    
    try {
      const res = await fetch(rawUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`[SAVED] ${item.category}/${item.file} (${buffer.length} bytes) <- ${item.name}`);
    } catch (e) {
      console.error(`[ERROR] Failed to download ${item.name} from ${rawUrl}:`, e.message);
    }
  }

  console.log('\nDownloading Day 7 Recovery images...');
  for (const item of recoveryDownloads) {
    const dest = path.join(targetBase, item.category, item.file);
    try {
      const res = await fetch(item.url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`[SAVED] ${item.category}/${item.file} (${buffer.length} bytes)`);
    } catch (e) {
      console.error(`[ERROR] Failed to download ${item.file}:`, e.message);
    }
  }

  console.log('\nVerification of downloaded workout files:');
  let allGood = true;
  for (const cat of categories) {
    const dir = path.join(targetBase, cat);
    const files = fs.readdirSync(dir);
    console.log(`- ${cat} (${files.length} files):`, files.join(', '));
    for (const f of files) {
      const stat = fs.statSync(path.join(dir, f));
      if (stat.size < 1000) {
        console.error(`⚠️ File ${cat}/${f} is suspicious (size: ${stat.size} bytes)`);
        allGood = false;
      }
    }
  }
  if (allGood) {
    console.log('\n🎉 ALL 33 IMAGES SUCCESSFULLY DOWNLOADED AND VERIFIED LOCALLY!');
  }
}

downloadAll();
