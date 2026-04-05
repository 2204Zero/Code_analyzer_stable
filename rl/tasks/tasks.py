def get_tasks():
    return [
        {
            "name": "easy_unused_variable",
            "difficulty": "easy",
            "description": "Identify simple unused variables in code",

            "expected_issue_keywords": ["unused", "not used"],
            "expected_fix_keywords": ["remove", "delete"]
        },

        {
            "name": "medium_code_quality",
            "difficulty": "medium",
            "description": "Detect code quality issues like indentation, readability",

            "expected_issue_keywords": ["indentation", "readability", "structure"],
            "expected_fix_keywords": ["format", "improve", "consistent"]
        },

        {
            "name": "hard_logic_issue",
            "difficulty": "hard",
            "description": "Detect logical or semantic issues in code",

            "expected_issue_keywords": ["logic", "incorrect", "bug", "error"],
            "expected_fix_keywords": ["fix logic", "correct", "change"]
        }
    ]