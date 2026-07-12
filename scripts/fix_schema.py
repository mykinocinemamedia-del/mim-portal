#!/usr/bin/env python3
"""Convert Prisma schema from snake_case to camelCase with @map annotations."""
import re
import sys
from pathlib import Path

INPUT = Path("/home/z/my-project/prisma/schema_pulled.prisma")
OUTPUT = Path("/home/z/my-project/prisma/schema.prisma")

def snake_to_camel(s):
    parts = s.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])

def is_relation_field(line):
    """Check if a field is a relation (array or model type)."""
    # Relations are like: model Field[] or Model?
    return bool(re.match(r'^\s+\w+\s+(Model|Model\[\]|Model\?)\s*$', line))

def convert_schema(content):
    lines = content.split("\n")
    result = []
    in_model = False
    skip_relation_fields = False
    
    for line in lines:
        stripped = line.strip()
        
        # Handle model header
        if stripped.startswith("model "):
            in_model = True
            result.append(line)
            continue
        
        if stripped.startswith("}") and in_model:
            in_model = False
            result.append(line)
            continue
        
        if in_model and stripped and not stripped.startswith("//") and not stripped.startswith("@@"):
            # Parse field: name type @attributes
            match = re.match(r'^(\s+)(\w+)\s+(\S+)(.*)$', line)
            if match:
                indent, field_name, field_type, attrs = match.groups()
                
                # Skip relation fields (they reference other models)
                # We detect them by checking if the type is a capitalized model name
                # but not a Prisma primitive type
                primitives = {'String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Bytes', 'Decimal', 'BigInt'}
                type_base = re.sub(r'[\[\]?]', '', field_type)
                type_base = re.sub(r'@.*', '', type_base).strip()
                
                if type_base not in primitives:
                    # This is a relation field - keep as-is but convert name to camelCase
                    camel_name = snake_to_camel(field_name)
                    # Add @map for relation field name
                    new_line = f"{indent}{camel_name} {field_type}{attrs}"
                    if camel_name != field_name:
                        new_line = f"{indent}{camel_name} {field_type}{attrs} @map(\"{field_name}\")"
                    result.append(new_line)
                else:
                    # Primitive field - convert to camelCase with @map
                    camel_name = snake_to_camel(field_name)
                    if camel_name != field_name:
                        # Check if there are existing @map or other attrs
                        if attrs.strip():
                            new_line = f"{indent}{camel_name} {field_type}{attrs} @map(\"{field_name}\")"
                        else:
                            new_line = f"{indent}{camel_name} {field_type} @map(\"{field_name}\")"
                        result.append(new_line)
                    else:
                        result.append(line)
            else:
                result.append(line)
        elif in_model and stripped.startswith("@@"):
            # Handle @@map, @@unique, etc.
            # Convert @@unique([field1, field2]) to use camelCase
            if stripped.startswith("@@unique(["):
                fields_match = re.search(r'@@unique\[(.*)\]', stripped)
                if fields_match:
                    fields_str = fields_match.group(1)
                    fields = [f.strip() for f in fields_str.split(",")]
                    camel_fields = [snake_to_camel(f) for f in fields]
                    result.append(f"  @@unique([{', '.join(camel_fields)}])")
                    continue
            result.append(line)
        else:
            result.append(line)
    
    return "\n".join(result)

def main():
    # First, pull the schema
    import subprocess
    print("Pulling schema from database...")
    result = subprocess.run(
        ["bunx", "prisma", "db", "pull", "--print"],
        capture_output=True, text=True, cwd="/home/z/my-project"
    )
    
    if result.returncode != 0:
        print(f"Pull failed: {result.stderr}")
        sys.exit(1)
    
    pulled = result.stdout
    print(f"Pulled schema: {len(pulled)} chars")
    
    # Convert
    print("Converting to camelCase with @map...")
    converted = convert_schema(pulled)
    
    # Add back the comment header
    header = """// MIM Portal - Prisma Schema (auto-generated with @map annotations)
// Compatible with PostgreSQL (Supabase production)

"""
    final = header + converted
    
    # Save
    OUTPUT.write_text(final)
    print(f"Saved to {OUTPUT}: {len(final)} chars")
    
    # Generate client
    print("Generating Prisma client...")
    gen_result = subprocess.run(
        ["bunx", "prisma", "generate"],
        capture_output=True, text=True, cwd="/home/z/my-project"
    )
    print(gen_result.stdout[-200:] if gen_result.stdout else gen_result.stderr[-200:])

if __name__ == "__main__":
    main()
