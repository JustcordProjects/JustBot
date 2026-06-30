import { assertEquals } from "@std/assert";
import parseTimestamp from '@/util/parse-timestamp.ts';

Deno.test("Timestamp parsing", () => {
  assertEquals(parseTimestamp("10s"), 10);
  assertEquals(parseTimestamp("2m"), 120);
  assertEquals(parseTimestamp("1h"), 3600);
  assertEquals(parseTimestamp("1d"), 86400);
  assertEquals(parseTimestamp("1h30m"), 5400);
  assertEquals(parseTimestamp("2godziny"), 7200);
  assertEquals(parseTimestamp("42"), 42);
  assertEquals(parseTimestamp("xyz"), null);
});
