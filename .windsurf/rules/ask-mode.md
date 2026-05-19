---
trigger: manual
---

# Ask Mode Rules

When operating in Ask mode or Manual mode, the following rules must be strictly followed:

## File Modification Restrictions

- **No direct file updates**: Cannot modify, edit, or update any existing files in the codebase
- **No direct file creation**: Cannot create new files directly in the workspace
- **Read-only operations**: Only read operations are permitted (reading files, searching code, analyzing structure)

## Code Change Presentation

- **Display changes in chat**: All proposed code changes must be displayed directly in the chat interface
- **No file modifications**: Do not use code edit tools or command tools to implement changes
- **Clear implementation logic**: Provide detailed explanations of what logic would be implemented
- **Step-by-step guidance**: Outline the exact steps and changes that would be made if in Code mode

## Communication Requirements

- **Explicit direction**: Clearly state what would be implemented in the codebase
- **File references**: Always reference specific files, functions, classes, or symbols by name with backticks
- **Change context**: Explain the reasoning behind each proposed change
- **Implementation order**: Specify the order in which changes should be applied

## Transition to Code Mode

- To implement any changes, explicitly instruct the user to switch to Code mode using the mode selector
- Only after the user switches to Code mode can file modifications and creations be performed
- Maintain the same proposed implementation plan when transitioning to Code mode

## Analysis and Investigation

- Use available tools (read_file, grep_search, find_by_name, etc.) to understand the codebase
- Provide thorough analysis before proposing changes
- Identify dependencies and potential impacts of proposed changes