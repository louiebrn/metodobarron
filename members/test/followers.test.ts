import assert from "node:assert/strict";
import test from "node:test";
import { applyFollowerMarkup, formatFollowers, tiktokMilestone } from "../src/lib/follower-format";
import { parseInstagramHtml, parseInstagramProfileJson, parseTikTokFollowers, saneFollowerCount } from "../src/lib/followers";
import { launchInstant, launchState } from "../src/lib/launch";

test("follower labels use pt-BR thousands", () => {
  assert.equal(formatFollowers(53600), "54 mil");
  assert.equal(formatFollowers(53587), "54 mil");
  assert.equal(formatFollowers(30000), "30 mil");
  assert.equal(formatFollowers(83600), "84 mil");
  assert.equal(formatFollowers(1_000_000), "1 mi");
});

test("tiktok milestone moves past 50 mil toward 75 mil", () => {
  const mark = tiktokMilestone(53600);
  assert.equal(mark.goal, 75_000);
  assert.equal(mark.previous, 50_000);
  assert.equal(mark.pct, 14);
});

test("markup replaces every follower slot from the same counts", () => {
  const html = [
    '<b data-f="total" data-n="1" data-countup>+1 mil</b>',
    '<b data-f="ig" data-n="1" data-countup>1 mil</b>',
    '<b data-f="tt" data-n="1" data-countup>1 mil</b>',
    '<span data-f="total-plain" data-n="1">1 mil</span>',
    "<b data-ms-cur>1 mil</b>",
    "<span data-ms-goal>2 mil</span>",
  ].join("");
  const next = applyFollowerMarkup(html, { instagram: 30000, tiktok: 53600 });
  assert.match(next, /data-n="30000" data-countup>30 mil/);
  assert.match(next, /data-n="53600" data-countup>54 mil/);
  assert.match(next, /data-n="83600" data-countup>\+84 mil/);
  assert.match(next, /data-n="83600">84 mil/);
  assert.match(next, /data-ms-cur>54 mil/);
  assert.match(next, /data-ms-goal>75 mil/);
});

test("tiktok parser prefers the precise count next to the handle", () => {
  const html = `"uniqueId":"mtdbarron","stats":{"followerCount":53600},"statsV2":{"followerCount":"53587"} "uniqueId":"other","stats":{"followerCount":9}`;
  assert.equal(parseTikTokFollowers(html, "mtdbarron"), 53587);
});

test("instagram parsers read json and profile html", () => {
  assert.equal(parseInstagramProfileJson({ data: { user: { edge_followed_by: { count: 30120 } } } }), 30120);
  assert.equal(parseInstagramHtml('<meta property="og:description" content="30K Followers, 10 Following" />'), 30000);
  assert.equal(parseInstagramHtml("nada"), null);
});

test("a wild scrape cannot replace the last known count", () => {
  assert.equal(saneFollowerCount(12, 30000), false);
  assert.equal(saneFollowerCount(200_000, 53600), false);
  assert.equal(saneFollowerCount(54000, 53600), true);
});

test("launch is 30 Nov 2026 at 12:00 Brasília and opens on the dot", () => {
  assert.equal(launchInstant(), Date.UTC(2026, 10, 30, 15, 0, 0));
  const before = launchState(launchInstant() - 1000);
  assert.equal(before.open, false);
  assert.match(before.remain, /^Faltam /);
  assert.deepEqual(launchState(launchInstant()), { open: true, remain: "" });
});
