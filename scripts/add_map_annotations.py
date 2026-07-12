#!/usr/bin/env python3
"""Add @map annotations to Prisma schema fields, handling inline comments correctly."""
import re
from pathlib import Path

SCHEMA = Path("/home/z/my-project/prisma/schema.prisma")

def camel_to_snake(name):
    result = []
    for i, char in enumerate(name):
        if char.isupper() and i > 0:
            result.append("_")
            result.append(char.lower())
        else:
            result.append(char.lower())
    return "".join(result)

def main():
    content = SCHEMA.read_text()
    lines = content.split("\n")
    
    result = []
    in_model = False
    primitives = {'String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Bytes', 'Decimal', 'BigInt'}
    
    for line in lines:
        stripped = line.strip()
        
        if stripped.startswith("model "):
            in_model = True
            result.append(line)
            continue
        
        if stripped == "}" and in_model:
            in_model = False
            result.append(line)
            continue
        
        if not in_model or not stripped or stripped.startswith("//") or stripped.startswith("@@"):
            result.append(line)
            continue
        
        # Split line into code part and comment part
        comment = ""
        code_part = line
        if "//" in code_part:
            # Find the comment position (but not inside a string)
            idx = code_part.find("//")
            comment = "  " + code_part[idx:]
            code_part = code_part[:idx]
        
        code_part = code_part.rstrip()
        if not code_part.strip():
            result.append(line)
            continue
        
        # Parse field: indent fieldName Type @attributes
        match = re.match(r'^(\s+)(\w+)\s+(\S+)(.*)$', code_part)
        if not match:
            result.append(line)
            continue
        
        indent, field_name, field_type, attrs = match.groups()
        
        # Skip relation fields
        type_base = field_type.replace('?', '').replace('[]', '')
        if type_base not in primitives:
            result.append(line)
            continue
        
        # Check if @map already exists
        if '@map' in attrs:
            result.append(line)
            continue
        
        # Check if field needs @map
        snake = camel_to_snake(field_name)
        if snake == field_name:
            result.append(line)
            continue
        
        # Build new line: fieldName Type attrs @map("snake") comment
        attrs = attrs.strip()
        if attrs:
            new_code = f"{indent}{field_name} {field_type} {attrs} @map(\"{snake}\")"
        else:
            new_code = f"{indent}{field_name} {field_type} @map(\"{snake}\")"
        
        if comment:
            new_line = new_code + comment
        else:
            new_line = new_code
        
        result.append(new_line)
    
    output = "\n".join(result)
    SCHEMA.write_text(output)
    print(f"Updated schema: {len(output)} chars")
    
    # Generate Prisma client
    import subprocess
    print("Generating Prisma client...")
    r = subprocess.run(["bunx", "prisma", "generate"], capture_output=True, text=True, cwd="/home/z/my-project")
    if r.returncode == 0:
        print("✓ Prisma client generated successfully")
    else:
        print(f"✗ Error: {r.stderr[-500:]}")

if __name__ == "__main__":
    main()
