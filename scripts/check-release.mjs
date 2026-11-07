// Refuses a release build that still contains test or placeholder values.
// Run by `npm run build:release -- android|ios`, after the production build into dist-www/.
// Only the target platform's IDs are required: Android ships before the iOS keys exist.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = path.join(root, "dist-www");

// Google's demo ad units and sample App IDs all use this publisher ID.
const GOOGLE_TEST_PUBLISHER_ID = "3940256099942544";
const PLACEHOLDER = "YOUR_";

const PLATFORMS = {
  android: { suffix: "ANDROID", appIdFile: "android/app/src/main/res/values/strings.xml" },
  ios: { suffix: "IOS", appIdFile: "ios/App/App/Info.plist" },
};

const platform = process.argv[2];
if (!PLATFORMS[platform]) {
  console.error("Usage: npm run build:release -- android|ios");
  process.exit(1);
}
const { suffix, appIdFile } = PLATFORMS[platform];
const errors = [];

const env = loadEnv("production", root, "VITE_");
for (const name of [`VITE_ADMOB_REWARDED_${suffix}`, `VITE_ADMOB_INTERSTITIAL_${suffix}`, `VITE_RC_KEY_${suffix}`]) {
  if (!env[name]) errors.push(`${name} is empty in .env.production`);
}
if (env.VITE_ADS_TESTING !== "false") errors.push("VITE_ADS_TESTING must be false in .env.production");

for (const file of await readdir(dist, { recursive: true })) {
  if (path.basename(file) === "debug.js") errors.push(`dist-www/${file} must not ship`);
  if (!/\.(js|html|css|json)$/.test(file)) continue;
  const text = await readFile(path.join(dist, file), "utf8");
  if (text.includes(GOOGLE_TEST_PUBLISHER_ID)) errors.push(`dist-www/${file} contains a Google test ID`);
  if (text.includes(PLACEHOLDER)) errors.push(`dist-www/${file} contains a "${PLACEHOLDER}" placeholder`);
}

const appIdText = await readFile(path.join(root, appIdFile), "utf8");
if (appIdText.includes(GOOGLE_TEST_PUBLISHER_ID)) errors.push(`${appIdFile} uses Google's sample AdMob App ID`);

if (errors.length) {
  console.error(`Release check failed (${platform}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Release check passed (${platform}).`);
