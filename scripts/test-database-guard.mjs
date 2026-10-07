export function assertTestDatabase(environment) {
  if (!environment.TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL_REQUIRED");
  const target = new URL(environment.TEST_DATABASE_URL);
  if (!target.hostname.endsWith(".neon.tech")) throw new Error("SEPARATE_NEON_TEST_DATABASE_REQUIRED");
  const identity = (url) => `${url.hostname.replace(/-pooler(?=\.)/, "")}${url.pathname}`;
  for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
    if (environment[key] && identity(new URL(environment[key])) === identity(target)) throw new Error("TEST_DATABASE_MUST_BE_SEPARATE");
  }
  return environment.TEST_DATABASE_URL;
}
