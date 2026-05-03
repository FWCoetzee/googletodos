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
    it("rejects values with embedded control characters", () => {
      expect(sanitizeRedirect("/about\nfoo")).toBe("/");
      expect(sanitizeRedirect("/ab\tout")).toBe("/");
      expect(sanitizeRedirect("/ab out")).toBe("/");
      expect(sanitizeRedirect("/about\x01")).toBe("/");
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

  describe("hash fragments", () => {
    it("preserves hash on allowed paths", () => {
      expect(sanitizeRedirect("/about#section")).toBe("/about#section");
      expect(sanitizeRedirect("/contact#form")).toBe("/contact#form");
    });
    it("preserves combined query and hash on allowed paths", () => {
      expect(sanitizeRedirect("/about?ref=signup#top")).toBe(
        "/about?ref=signup#top"
      );
    });
    it("rejects hash on disallowed paths", () => {
      expect(sanitizeRedirect("/admin#section")).toBe("/");
    });
    it("rejects hash that loops back to /auth", () => {
      expect(sanitizeRedirect("/auth#callback")).toBe("/");
    });
  });

  describe("mixed encoded characters", () => {
    it("decodes encoded slash in path", () => {
      expect(sanitizeRedirect("%2Fcontact")).toBe("/contact");
    });
    it("accepts lowercase percent-encoding", () => {
      expect(sanitizeRedirect("%2fabout")).toBe("/about");
    });
    it("decodes encoded query separator and preserves it", () => {
      expect(sanitizeRedirect("/about%3Fref=signup")).toBe(
        "/about?ref=signup"
      );
    });
    it("decodes encoded hash separator and preserves it", () => {
      expect(sanitizeRedirect("/about%23section")).toBe("/about#section");
    });
    it("rejects when encoded value resolves to an external URL", () => {
      // "https%3A%2F%2Fevil.com" decodes to "https://evil.com"
      expect(sanitizeRedirect("https%3A%2F%2Fevil.com")).toBe("/");
    });
    it("rejects when encoded value resolves to a protocol-relative URL", () => {
      // "%2F%2Fevil.com" decodes to "//evil.com"
      expect(sanitizeRedirect("%2F%2Fevil.com")).toBe("/");
    });
  });

  describe("double-encoding", () => {
    it("does not recursively decode an allowed path", () => {
      // "%252Fabout" decodes once to "%2Fabout" which does not start with "/"
      expect(sanitizeRedirect("%252Fabout")).toBe("/");
    });
    it("does not let double-encoding bypass the /auth loop guard", () => {
      // "%252Fauth" decodes once to "%2Fauth" → does not start with "/"
      expect(sanitizeRedirect("%252Fauth")).toBe("/");
    });
    it("does not let double-encoding bypass external URL rejection", () => {
      // Decodes once to "https%3A%2F%2Fevil.com" which still does not start with "/"
      expect(sanitizeRedirect("https%253A%252F%252Fevil.com")).toBe("/");
    });
    it("rejects malformed double-encoded values", () => {
      // Invalid percent-encoding causes decodeURIComponent to throw
      expect(sanitizeRedirect("%%2Fabout")).toBe("/");
    });
  });
});
