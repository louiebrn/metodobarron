import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { monthlyScore } from "@/lib/points";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { monthKey } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  const score = monthlyScore(getDb(), user.id, monthKey());
  return (
    <Shell username={user.username} points={score?.points ?? 0}>
      {children}
    </Shell>
  );
}
