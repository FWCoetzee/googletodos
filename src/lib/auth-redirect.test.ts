import { describe, it, expect } from "vitest";
import { sanitizeRedirect } from "./auth-redirect";

describe("sanitizeRedirect", () => {
  describe("default fallback", () => {
    it("returns / for null", () => {
      expect(sanitizeRedirect(null)).toBe("/");
    });
    it("returns / for undefined", () => {
      expect(sanitizeRedirect(undefined)).toBe("/");
    });
    it("returns / for empty string", () => {
      expect(sanitizeRedirect("")).toBe("/");
    });
    it("returns / for whitespace-only string", () => {
      expect(sanitizeRedirect("   ")).toBe("/");
    });
    it("returns / for non-string input", () => {
      // @ts-expect-error testing runtime guard
      expect(sanitizeRedirect(42)).toBe("/");
      // @ts-expect-error testing runtime guard
      expect(sanitizeRedirect({})).toBe("/");
    });
  });

  describe("loop prevention", () => {
    it("rejects /auth (would loop back to login)", () => {
      expect(sanitizeRedirect("/auth")).toBe("/");
    });
    it("rejects /auth with query string", () => {
      expect(sanitizeRedirect("/auth?redirect=/about")).toBe("/");
    });
    it("rejects /auth with hash", () => {
      expect(sanitizeRedirect("/auth#foo")).toBe("/");
    });
    it("rejects encoded /auth", () => {
      expect(sanitizeRedirect("%2Fauth")).toBe("/");
    });
  });

  describe("disallowed paths", () => {
    it("rejects unknown paths", () => {
      expect(sanitizeRedirect("/admin")).toBe("/");
      expect(sanitizeRedirect("/dashboard")).toBe("/");
      expect(sanitizeRedirect("/settings/profile")).toBe("/");
    });
    it("rejects 404-like paths", () => {
      expect(sanitizeRedirect("/does-not-exist")).toBe("/");
    });
  });

  describe("malformed / unsafe values", () => {
    it("rejects fully-qualified external URLs", () => {
      expect(sanitizeRedirect("https://evil.com")).toBe("/");
      expect(sanitizeRedirect("http://example.com/about")).toBe("/");
    });
    it("rejects protocol-relative URLs", () => {
      expect(sanitizeRedirect("//evil.com")).toBe("/");
      expect(sanitizeRedirect("//evil.com/about")).toBe("/");
    });
    it("rejects backslash tricks", () => {
      expect(sanitizeRedirect("/\\evil.com")).toBe("/");
    });
    it("rejects javascript: pseudo-protocol", () => {
      expect(sanitizeRedirect("javascript:alert(1)")).toBe("/");
    });
    it("rejects data: URLs", () => {
      expect(sanitizeRedirect("data:text/html,<script>")).toBe("/");
    });
    it("rejects paths not starting with /", () => {
      expect(sanitizeRedirect("about")).toBe("/");
      expect(sanitizeRedirect("./about")).toBe("/");
    });
    it("rejects values with control characters", () => {
      expect(sanitizeRedirect("/about\n")).toBe("/");
      expect(sanitizeRedirect("/about\t")).toBe("/");
      expect(sanitizeRedirect("/ab out")).toBe("/");
    });
    it("returns / when decodeURIComponent throws", () => {
      expect(sanitizeRedirect("%E0%A4%A")).toBe("/");
    });
  });

  describe("allowed paths", () => {
    it("accepts /", () => {
      expect(sanitizeRedirect("/")).toBe("/");
    });
    it("accepts /about", () => {
      expect(sanitizeRedirect("/about")).toBe("/about");
    });
    it("accepts /contact", () => {
      expect(sanitizeRedirect("/contact")).toBe("/contact");
    });
    it("preserves query string on allowed paths", () => {
      expect(sanitizeRedirect("/about?ref=email")).toBe("/about?ref=email");
    });
    it("decodes encoded allowed paths", () => {
      expect(sanitizeRedirect("%2Fabout")).toBe("/about");
    });
    it("trims surrounding whitespace before validating", () => {
      expect(sanitizeRedirect("  /contact  ")).toBe("/contact");
    });
  });
});
