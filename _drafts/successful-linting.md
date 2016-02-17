## Should I add this rule?

Here are some guiding questions you could ask yourself to determine if a rule is worth adding:

    Have you seen this type of error manually corrected via our code review process?
    Does correcting this error provide actual value? Could you explain the value to a non-technical person and have them understand?
    Could blindly "correcting" this issue lead to worse code?

Rolling out a new linting rule:

    Fix all existing instances of the rule being broken.
    Add the rule as a warning, to give other developers time to adjust to the new style, and to ensure no existing PRs are blocked.
    Wait 2-4 weeks.
    Fix any newly introduced instances of the error (places where people ignored the warning).
    Switch the rule from a warning to an error.

On the use of warnings:

Warnings which are never going to get fixed have a negative value. They reinforce the notion that warnings are acceptable and can safely be ignored.

Ideally warnings should only be used for rules which are on an active path towards being errors.
Enforcing rules:

Rules should be enforced in the following places:

    As a pre-commit Git hook
    As part of our Travis tests
    Via a tool that developers can run manually
