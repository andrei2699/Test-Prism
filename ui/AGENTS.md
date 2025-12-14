# Agent Instructions

## Code Comments

- **Do NOT add comments to code.** Comments should only be included if explicitly and directly requested by the user in the prompt.
- Code should be self-documenting through clear naming and structure.

## Testing Requirements

- **Write unit tests for every code change using Vitest**
- Tests should be created/updated in `.spec.ts` files
- **Focus tests on behavior, not internal structure** - test what the component does, not how it does it
  - Test inputs and outputs (signals in, rendered content out)
  - Test data transformations and business logic
  - Avoid testing private methods or internal implementation details
  - Don't make assertions about internal computed values unless they directly affect behavior
- Use Vitest syntax: `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `vi`
- Do NOT use Jasmine syntax (no `jasmine.objectContaining`, `jasmine.any`, `TestBed`, etc.)
- Use plain object assertions or `toMatchObject()` for partial matches
- Follow the existing testing patterns in the project
- Ensure tests cover the new functionality
- Tests should be written before or alongside implementation (TDD approach preferred)

## CSS and Styling

- **Use CSS classes only as needed** - avoid creating unnecessary classes
- Remove unused CSS classes from stylesheets
- Keep styles minimal and focused on functionality
- Use semantic class naming when classes are needed
- Prefer reusable, utility-like classes over one-off styles

## Code Style

- Follow the existing code style and patterns in this Angular project
- Maintain consistency with TypeScript, HTML, and CSS conventions
- Use meaningful variable and function names
- Prefer composition and functional approaches
- **Prefer Signals over older Angular patterns.** For example, use `viewChild()` instead of `@ViewChild()`, `input()` instead of `@Input()`, etc.

## General

- Prioritize code clarity and maintainability
- Avoid over-engineering solutions
- Ask for clarification if requirements are ambiguous
- **All code changes must be verified to compile successfully.**
