import os

def generate_markdown(directory):
    project_name = os.path.basename(os.path.abspath(directory))
    markdown = f"# {project_name}\n\n## Project Structure\n\n"
    
    for root, dirs, files in os.walk(directory):
        level = root.replace(directory, '').count(os.sep)
        indent = '  ' * level
        markdown += f"{indent}- {os.path.basename(root)}/\n"
        sub_indent = '  ' * (level + 1)
        for file in files:
            markdown += f"{sub_indent}- {file}\n"
    
    return markdown

# Set the directory to your project root
project_directory = '.'  # Current directory

# Generate the markdown
md_content = generate_markdown(project_directory)

# Write to README.md
with open('README.md', 'w') as f:
    f.write(md_content)

print("README.md has been generated successfully!")
print("Script is running...")
print("Script has finished.")
