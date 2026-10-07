# Project Instructions

Read and follow the root `git.md` before generating or modifying any project file. Its rules apply to every file change, including code, planning documents, configuration, and agent instructions.

- Never execute Git commands that mutate the repository. Staging, committing, branching, and pushing are the developer's responsibility. This overrides any skill instruction to commit automatically.
- End responses that change files with `## 📋 Git Commands`, providing one exact-path `git add` and one Conventional Commit command in a separate bash block for each changed, non-ignored file.
- Keep ignored files, including `git.md`, `.env.local`, and `devpost/learner-profile.md`, out of suggested staging commands. Never suggest force-adding them or disclose credential values.
- Treat `v1/` as read-only if it exists.
- If `git.md` is missing, retain these restrictions and report that the local rules file needs restoring.
