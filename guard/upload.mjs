#!/usr/bin/env node
// Guarded upload of a finished reel to the private "backin-reels" bucket.
// Prints a 7-day private link for Buffer, plus current usage.
//   node upload.mjs path/to/video.mp4      upload (refused if unsafe)
//   node upload.mjs --usage                show usage only
// Credentials come from the macOS Keychain (account "backin-reels"), or env vars in the cloud:
//   CF_REELS_USAGE, CF_REELS_S3_ID, CF_REELS_S3_SECRET
import { createHash, createHmac } from "node:crypto";
import { readFileSync, statSync, existsSync } from "node:fs";
import { basename } from "node:path";
import { execFileSync } from "node:child_process";
import { getUsage, describe, ACCOUNT_ID, BUCKET, MAX_FILE_BYTES } from "./usage.mjs";

const secret = (env, svc) =>
  process.env[env] ||
  execFileSync("security", ["find-generic-password", "-a", "backin-reels", "-s", svc, "-w"]).toString().trim();

const HOST = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const LINK_SECONDS = 7 * 24 * 3600; // matches the 7-day auto-delete

const sha = (d) => createHash("sha256").update(d).digest("hex");
const hmac = (k, d) => createHmac("sha256", k).update(d).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

function sign({ method, key, query = {}, headers = {}, payloadHash, id, secretKey, now = new Date() }) {
  const amz = now.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const day = amz.slice(0, 8);
  const scope = `${day}/auto/s3/aws4_request`;
  const path = `/${BUCKET}/${key.split("/").map(enc).join("/")}`;
  const h = { host: HOST, ...headers };
  const signedHeaders = Object.keys(h).map((k) => k.toLowerCase()).sort().join(";");
  const q = { ...query };
  const isPresign = method === "GET";
  if (isPresign) {
    Object.assign(q, {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${id}/${scope}`,
      "X-Amz-Date": amz,
      "X-Amz-Expires": String(LINK_SECONDS),
      "X-Amz-SignedHeaders": signedHeaders,
    });
  } else {
    h["x-amz-date"] = amz;
    h["x-amz-content-sha256"] = payloadHash;
  }
  const sh = Object.keys(h).map((k) => k.toLowerCase()).sort();
  const canonQuery = Object.keys(q).sort().map((k) => `${enc(k)}=${enc(q[k])}`).join("&");
  const canonHeaders = sh.map((k) => `${k}:${String(h[Object.keys(h).find((x) => x.toLowerCase() === k)]).trim()}\n`).join("");
  const canon = [method, path, canonQuery, canonHeaders, sh.join(";"), isPresign ? "UNSIGNED-PAYLOAD" : payloadHash].join("\n");
  const toSign = ["AWS4-HMAC-SHA256", amz, scope, sha(canon)].join("\n");
  let k = hmac("AWS4" + secretKey, day);
  for (const part of ["auto", "s3", "aws4_request"]) k = hmac(k, part);
  const sig = createHmac("sha256", k).update(toSign).digest("hex");
  if (isPresign) return `https://${HOST}${path}?${canonQuery}&X-Amz-Signature=${sig}`;
  h.authorization = `AWS4-HMAC-SHA256 Credential=${id}/${scope}, SignedHeaders=${sh.join(";")}, Signature=${sig}`;
  return { url: `https://${HOST}${path}`, headers: h };
}

// Link served by the reels-guard Worker (answers GET and HEAD, which Buffer needs).
export async function bufferLink(key) {
  const exp = Math.floor(Date.now() / 1000) + LINK_SECONDS;
  const sig = createHmac("sha256", secret("REELS_LINK_SECRET", "reels-link-secret")).update(`${exp}/${key}`).digest("hex").slice(0, 40);
  return `https://reels-guard.backin-reels.workers.dev/v/${exp}/${sig}/${key}`;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) { console.error("usage: node upload.mjs <video.mp4> [--about prompt.md] [--title Name] [--source Claude] | --usage"); process.exit(2); }

  // Guard 1: usage must be readable and under 30% on every limit (fails closed).
  const usage = await getUsage(secret("CF_REELS_USAGE", "cf-reels-usage"));
  console.log(describe(usage));
  if (arg === "--usage") return;
  if (usage.level !== "ok") {
    console.error(`\nREFUSED: usage is at ${(usage.worst * 100).toFixed(1)}% of a free limit (uploads stop at 30%).`);
    process.exit(3);
  }

  // Guard 2: file size cap and type.
  const size = statSync(arg).size;
  if (size > MAX_FILE_BYTES) { console.error(`\nREFUSED: file is ${(size / 1e6).toFixed(1)} MB, cap is 100 MB.`); process.exit(4); }
  if (!/\.(mp4|mov)$/i.test(arg)) { console.error("\nREFUSED: only .mp4 or .mov reels."); process.exit(5); }

  const id = secret("CF_REELS_S3_ID", "cf-reels-s3-id");
  const secretKey = secret("CF_REELS_S3_SECRET", "cf-reels-s3-secret");
  const body = readFileSync(arg);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const key = `reels/${stamp}-${basename(arg).replace(/[^\w.-]/g, "_")}`;

  const put = sign({ method: "PUT", key, headers: { "content-type": "video/mp4" }, payloadHash: sha(body), id, secretKey });
  const res = await fetch(put.url, { method: "PUT", headers: put.headers, body });
  if (!res.ok) {
    console.error(`\nUpload failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
    if (res.status === 404) console.error("The bucket is gone, so the kill switch has probably fired. Check email.");
    process.exit(6);
  }
  console.log(`\nUploaded ${(size / 1e6).toFixed(1)} MB as ${key}`);

  // Dashboard sidecar: title + detailed AI prompt, stored next to the video as <key>.json.
  const flag = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const stem = basename(arg).replace(/\.\w+$/, "");
  const here = new URL(".", import.meta.url).pathname;
  const aboutFile = flag("--about") ?? [`${here}../video/about/${stem}.md`, `${here}../instagram-video/about/${stem}.md`].find((p) => existsSync(p));
  const prompt = aboutFile && existsSync(aboutFile) ? readFileSync(aboutFile, "utf8").trim() : "";
  const title = flag("--title") ?? (prompt.match(/^Title: "([^"]+)"/m)?.[1] || stem.replace(/[-_]/g, " "));
  const meta = Buffer.from(JSON.stringify({ title, prompt, source: flag("--source") ?? (process.env.GITHUB_ACTIONS ? "GitHub" : "Mac"), file: basename(arg) }));
  const mput = sign({ method: "PUT", key: `${key}.json`, headers: { "content-type": "application/json" }, payloadHash: sha(meta), id, secretKey });
  const mres = await fetch(mput.url, { method: "PUT", headers: mput.headers, body: meta });
  console.log(mres.ok ? `Dashboard info saved (${prompt ? "with" : "without"} AI prompt)` : `Dashboard info not saved: ${mres.status}`);
  // GitHub logs on a public repo are world-readable: never print the private link there.
  if (process.env.GITHUB_ACTIONS) console.log("Private link not printed here (public log). It is on the dashboard.");
  else console.log(`Private link for Buffer (expires in 7 days, file auto-deletes then):\n${await bufferLink(key)}`);
}

export { sign, secret };
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error("REFUSED (guard error, failing closed): " + e.message); process.exit(1); });
}
