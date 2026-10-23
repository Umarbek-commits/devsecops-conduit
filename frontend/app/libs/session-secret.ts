export function getSessionSecret(value: string | undefined): string {
  const secret = value?.trim();
  if (!secret) {
    throw new Error(
      "SESSION_SECRET must be set to a non-empty value before the server starts.",
    );
  }

  return secret;
}
