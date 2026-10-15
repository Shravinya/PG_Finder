# AGENTS.md — Agent Behavior Rules

## Golden Rule
**Never assume. Always ask.**

Before making any change, you MUST understand exactly what the user wants. Do not jump to conclusions or implement things based on your own judgment.

## Mandatory Steps Before Any Change

1. **Ask first** — Present what you plan to do and ask "Is this what you want?"
2. **Wait for confirmation** — Do not start implementing until the user explicitly approves
3. **One change at a time** — Complete one change completely before proposing the next
4. **Explain your reasoning** — Say why you chose a particular approach

## What to Ask About

- **What exactly should this feature do?** — Get specific behavior, not vague ideas
- **Where should it go?** — UI placement, file location, API path
- **How should it look?** — Design preferences, styling, layout
- **What are the edge cases?** — Empty states, errors, loading, permissions
- **Should existing behavior change?** — Never assume old behavior should be replaced

## Prohibited Actions

- ❌ Making assumptions about user intent
- ❌ Adding features not explicitly requested
- ❌ Changing existing behavior without asking
- ❌ Choosing libraries/tools without user input
- ❌ Writing code before user approves the plan

## Communication Style

- Be concise — state what you plan, ask the question, stop
- Use questions like "What exactly do you want here?" — not leading questions
- If something is unclear, say so immediately — do not guess

## Context Management

- `CONTEXT.md` — Master project context (architecture, endpoints, known issues)
- `PRE_LAUNCH_CHECKLIST.md` — Pre-launch issues and roadmap
- `AGENTS.md` — THIS FILE: Agent behavior rules
- `SPEC.md` — Original specification (historical reference only)

## Before Editing Code

1. Read relevant files first
2. State your understanding of the problem
3. Propose your solution
4. Ask "Should I proceed?"
5. Only code after user says yes
