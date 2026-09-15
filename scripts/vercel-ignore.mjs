// Vercel's ignored-build convention: 0 skips, 1 builds.
process.exit(process.env.VERCEL_GIT_COMMIT_REF === "hive/metrics" ? 0 : 1);
