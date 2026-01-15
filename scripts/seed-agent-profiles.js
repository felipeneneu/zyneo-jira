const fs = require("fs");
const path = require("path");
const { Client, Databases, ID, Query } = require("node-appwrite");

const requiredEnv = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT",
  "NEXT_APPWRITE_KEY",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  "NEXT_PUBLIC_APPWRITE_AGENT_PROFILES_ID",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`);
  }
}

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const key = process.env.NEXT_APPWRITE_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_AGENT_PROFILES_ID;

const seedPath = path.join(__dirname, "agent-profiles.seed.json");
const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(project)
  .setKey(key);
const databases = new Databases(client);

const upsertProfile = async (profile) => {
  const existing = await databases.listDocuments(databaseId, collectionId, [
    Query.equal("slug", profile.slug),
    Query.limit(1),
  ]);

  if (existing.total > 0) {
    const current = existing.documents[0];
    await databases.updateDocument(
      databaseId,
      collectionId,
      current.$id,
      profile
    );
    return { id: current.$id, action: "updated" };
  }

  const created = await databases.createDocument(
    databaseId,
    collectionId,
    ID.unique(),
    profile
  );
  return { id: created.$id, action: "created" };
};

(async () => {
  for (const profile of seedData) {
    const result = await upsertProfile(profile);
    console.log(`${result.action}: ${profile.slug} (${result.id})`);
  }
})().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
