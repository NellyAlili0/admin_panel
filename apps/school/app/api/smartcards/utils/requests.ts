export async function makeAuthenticatedRequest(
  url: string,
  token: string,
  options: RequestInit = {},
  retries = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      if (!res.ok && res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt < retries)
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      else throw err;
    }
  }
  throw new Error("Request failed after retries");
}
