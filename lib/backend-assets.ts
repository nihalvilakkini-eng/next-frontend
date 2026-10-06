export function getBackendAssetUrl(assetPath: string) {
  const normalizedPath = assetPath.replace(/\\/g, "/");

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const relativePath = normalizedPath.replace(/^\/+/, "");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

  if (!backendUrl) {
    return `/${relativePath}`;
  }

  return new URL(
    relativePath,
    `${backendUrl.replace(/\/+$/, "")}/`
  ).toString();
}