import "server-only";

export function serverEnv() {
  const rapidapiKey = process.env.RAPIDAPI_KEY?.trim();
  const signingSecret = process.env.APP_SIGNING_SECRET?.trim();
  if (!rapidapiKey || !signingSecret || Buffer.byteLength(signingSecret) < 32) {
    throw new Error("SERVER_CONFIGURATION");
  }
  return { rapidapiKey, signingSecret };
}
