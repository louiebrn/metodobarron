import { NextResponse } from "next/server";
import { formatFollowers, followerTotal } from "@/lib/follower-format";
import { loadFollowerCounts } from "@/lib/followers";

export const dynamic = "force-dynamic";

export async function GET() {
  const counts = await loadFollowerCounts();
  const total = followerTotal(counts);
  return NextResponse.json(
    {
      instagram: counts.instagram,
      tiktok: counts.tiktok,
      total,
      instagramSource: counts.instagramSource,
      tiktokSource: counts.tiktokSource,
      instagramUpdatedAt: counts.instagramUpdatedAt,
      tiktokUpdatedAt: counts.tiktokUpdatedAt,
      formatted: {
        instagram: formatFollowers(counts.instagram),
        tiktok: formatFollowers(counts.tiktok),
        total: formatFollowers(total),
      },
    },
    {
      headers: {
        "cache-control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    },
  );
}
