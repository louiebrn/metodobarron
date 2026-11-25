import { refreshFollowerFile } from "../src/lib/followers";

async function main() {
  const result = await refreshFollowerFile();
  for (const note of result.notes) console.log(note);
  if (result.changed) console.log("followers.json atualizado");
  else console.log("followers.json sem alteração");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
