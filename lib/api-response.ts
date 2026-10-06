export async function readResponseBody(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return { data: null, isJson: true, text };
  }

  try {
    return {
      data: JSON.parse(text) as unknown,
      isJson: true,
      text,
    };
  } catch {
    return { data: null, isJson: false, text };
  }
}

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function extractHtmlMessage(html: string) {
  const plainText = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  return plainText
    .split(/\s+at\s+/i, 1)[0]
    .replace(/^(?:Error\s*:?\s*)+/i, "")
    .trim();
}

