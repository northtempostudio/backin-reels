// Shared R2 free-tier guard for the separate "BackIn Reels" Cloudflare account.
// Used by the hourly guard Worker (worker.mjs) and the upload script (upload.mjs).
// Nothing here touches BackIn's own Cloudflare account.

export const ACCOUNT_ID = "797c51777935ca71cf984c7d75349284";
export const BUCKET = "backin-reels";

// Cloudflare R2 free tier (per month).
export const FREE = {
  storageBytes: 10 * 1e9, // 10 GB
  classA: 1_000_000,
  classB: 10_000_000,
};
export const WARN_AT = 0.3; // email + uploads refused from here
export const KILL_AT = 0.6; // bucket emptied and deleted from here
export const MAX_FILE_BYTES = 100 * 1e6; // 100 MB per upload

// Operations Cloudflare does not bill.
const FREE_OPS = new Set(["DeleteObject", "DeleteObjects", "DeleteBucket", "AbortMultipartUpload"]);
// Class B (reads). Anything not listed here or above is counted as Class A, the stricter bucket.
const CLASS_B = new Set([
  "GetObject", "HeadObject", "HeadBucket", "GetBucketEncryption", "GetBucketLocation",
  "GetBucketCors", "GetBucketLifecycleConfiguration", "UsageSummary",
]);

function monthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

export async function getUsage(apiToken, fetchImpl = fetch) {
  const since = monthStart();
  const query = `{
    viewer { accounts(filter: {accountTag: "${ACCOUNT_ID}"}) {
      storage: r2StorageAdaptiveGroups(limit: 1000, filter: {date_geq: "${since}"}) {
        max { payloadSize metadataSize uploadCount objectCount }
        dimensions { date bucketName }
      }
      ops: r2OperationsAdaptiveGroups(limit: 1000, filter: {date_geq: "${since}"}) {
        sum { requests }
        dimensions { actionType }
      }
    } }
  }`;
  const res = await fetchImpl("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiToken}`, "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const body = await res.json();
  if (!res.ok || body.errors?.length) {
    // Fail closed: if usage can't be read, callers must treat it as unsafe.
    throw new Error("usage query failed: " + JSON.stringify(body.errors ?? res.status));
  }
  const acct = body.data.viewer.accounts[0] ?? { storage: [], ops: [] };

  // Peak stored bytes on any day this month, summed across buckets per day.
  const perDay = {};
  for (const g of acct.storage) {
    const d = g.dimensions.date;
    perDay[d] = (perDay[d] ?? 0) + (g.max.payloadSize ?? 0) + (g.max.metadataSize ?? 0);
  }
  const storageBytes = Math.max(0, ...Object.values(perDay));

  let classA = 0, classB = 0;
  for (const g of acct.ops) {
    const t = g.dimensions.actionType;
    if (FREE_OPS.has(t)) continue;
    if (CLASS_B.has(t)) classB += g.sum.requests;
    else classA += g.sum.requests;
  }

  const pct = {
    storage: storageBytes / FREE.storageBytes,
    classA: classA / FREE.classA,
    classB: classB / FREE.classB,
  };
  const worst = Math.max(pct.storage, pct.classA, pct.classB);
  return {
    since, storageBytes, classA, classB, pct, worst,
    level: worst >= KILL_AT ? "kill" : worst >= WARN_AT ? "warn" : "ok",
  };
}

export function describe(u) {
  const p = (x) => (x * 100).toFixed(2) + "%";
  return [
    `R2 usage for BackIn Reels since ${u.since}:`,
    `  Storage: ${(u.storageBytes / 1e9).toFixed(3)} GB of 10 GB free (${p(u.pct.storage)})`,
    `  Class A: ${u.classA.toLocaleString()} of 1,000,000 free (${p(u.pct.classA)})`,
    `  Class B: ${u.classB.toLocaleString()} of 10,000,000 free (${p(u.pct.classB)})`,
    `  Status: ${u.level.toUpperCase()} (warn at ${WARN_AT * 100}%, kill switch at ${KILL_AT * 100}%)`,
  ].join("\n");
}
