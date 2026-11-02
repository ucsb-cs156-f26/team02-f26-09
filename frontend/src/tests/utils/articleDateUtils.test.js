import { toDateTimeLocal, toUtcIsoString } from "main/utils/articleDateUtils";

describe("articleDateUtils", () => {
  describe("toDateTimeLocal", () => {
    test("drops the zone from a UTC ISO string", () => {
      expect(toDateTimeLocal("2026-10-29T05:26:03Z")).toBe(
        "2026-10-29T05:26:03",
      );
    });

    test("drops fractional seconds and the zone", () => {
      expect(toDateTimeLocal("2026-10-29T05:26:03.123Z")).toBe(
        "2026-10-29T05:26:03",
      );
    });
  });

  describe("toUtcIsoString", () => {
    test("adds missing seconds and the Z", () => {
      expect(toUtcIsoString("2026-10-29T10:30")).toBe("2026-10-29T10:30:00Z");
    });

    test("keeps existing seconds and adds the Z", () => {
      expect(toUtcIsoString("2026-10-29T05:26:03")).toBe(
        "2026-10-29T05:26:03Z",
      );
    });
  });
});
