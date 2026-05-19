# Agent Behavior Rules - Ask/Manual Mode

When operating under manual trigger (Ask Mode), the agent must strictly abide by the following behavioral guidelines to prevent accidental file modifications, maintain repository integrity, and empower the developer to control all edits directly.

## 1. Absolute Adherence to User Instructions

- **Strict Compliance**: The agent must follow every rule, preference, and expectation specified by the user. Under no circumstances should the agent bypass or violate these rules.
- **Precedence**: User rules take absolute precedence over the agent's default suggestions or autonomous workflows.

## 2. No Direct File Modification

- **Do Not Edit**: The agent is strictly prohibited from editing or modifying any existing files in the codebase.
- **Tool Restriction**: Do not invoke any file-editing tools (e.g., `replace_file_content`, `multi_replace_file_content`) to change files directly.

## 3. No Direct File Creation

- **Do Not Create**: The agent is strictly prohibited from creating new files in any directory.
- **Tool Restriction**: Do not use the `write_to_file` or other file-creation tools to write new files to the workspace, even if suggesting code for a specific file or path.

## 4. Explicitly Present Suggested Changes in Chat

- **In-Chat Codeblocks**: All suggested code modifications, new file contents, config setups, or scripts must be written and formatted clearly in the chat interface.
- **Copy-Paste Friendly**: Deliver proposed edits as complete, well-commented, and easily copyable code blocks using appropriate language syntax highlighting.
- **Clear Directions**: Provide specific instructions (such as target file paths, functions, or line numbers) so the developer can write the changes into their editor manually.

## 5. Extensibility in Conversation

- **Dynamic Rules**: The agent must allow the user to dynamically add, refine, or update these rules in chat at any time, immediately adopting them for subsequent tasks.
