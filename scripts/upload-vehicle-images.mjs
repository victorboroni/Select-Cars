import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const fileEnv = loadEnvFile(path.join(projectRoot, ".env"));
const supabaseUrl =
  process.env.VITE_SUPABASE_URL ?? fileEnv.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ??
  fileEnv.VITE_SUPABASE_ANON_KEY ??
  fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "";

const BUCKET = "vehicle-images";
const LOGIN_EMAIL = "selectcars@selectcars.com";
const LOGIN_PASSWORD = "selectcars123";

const uploads = [
  {
    local: "src/imports/Image__Porsche_911_GT3_RS_.png",
    remote: "porsche-911-gt3-rs/cover.png",
  },
  {
    local: "src/imports/Image__Porsche_911_GT3_RS_em_destaque_.png",
    remote: "porsche-911-gt3-rs/hero.png",
  },
  {
    local: "src/imports/Image__Ferrari_296_GTB_.png",
    remote: "ferrari-296-gtb/cover.png",
  },
  {
    local: "src/imports/Image__Lamborghini_Hurac_n_Tecnica_.png",
    remote: "lamborghini-huracan-tecnica/cover.png",
  },
  {
    local: "src/imports/Image__Mercedes-AMG_GT_63_S_.png",
    remote: "mercedes-amg-gt-63-s/cover.png",
  },
  {
    local: "src/imports/Image__Aston_Martin_DB12_.png",
    remote: "aston-martin-db12/cover.png",
  },
  {
    local: "src/imports/Image__Bentley_Continental_GT_Speed_.png",
    remote: "bentley-continental-gt-speed/cover.png",
  },
];

function publicUrl(remotePath) {
  const base = supabaseUrl.replace(/\/$/, "");
  const encoded = remotePath.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

async function verifyPublicUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("FAIL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    });

  if (signInError) {
    console.error("LOGIN: failed");
    console.error(`LOGIN_ERROR: ${signInError.message}`);
    if (signInError.status) console.error(`LOGIN_STATUS: ${signInError.status}`);
    process.exit(1);
  }

  console.log("LOGIN: success");
  if (signInData.user?.email) {
    console.log(`LOGIN_USER: ${signInData.user.email}`);
  }

  const results = [];

  for (const { local, remote } of uploads) {
    const localPath = path.join(projectRoot, local);
    const label = `${local} -> ${remote}`;

    if (!fs.existsSync(localPath)) {
      console.error(`UPLOAD FAIL: ${label} — local file not found`);
      results.push({ remote, status: "missing_local" });
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(remote, fileBuffer, {
        upsert: true,
        contentType: "image/png",
      });

    if (uploadError) {
      console.error(`UPLOAD FAIL: ${label} — ${uploadError.message}`);
      results.push({ remote, status: "upload_failed", message: uploadError.message });
      continue;
    }

    const url = publicUrl(remote);
    const verify = await verifyPublicUrl(url);
    if (verify.ok) {
      console.log(`UPLOAD OK: ${label}`);
      console.log(`PUBLIC URL OK (${verify.status}): ${url}`);
      results.push({ remote, status: "ok", publicStatus: verify.status, url });
    } else {
      console.error(`UPLOAD OK but PUBLIC URL FAIL: ${label} — HTTP ${verify.status}`);
      if (verify.error) console.error(`PUBLIC URL ERROR: ${verify.error}`);
      console.log(`PUBLIC URL: ${url}`);
      results.push({
        remote,
        status: "public_fail",
        publicStatus: verify.status,
        url,
      });
    }
  }

  await supabase.auth.signOut();
  console.log("LOGOUT: success");

  const failed = results.filter((r) => r.status !== "ok");
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("FATAL:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
