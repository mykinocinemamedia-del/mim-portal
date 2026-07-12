#!/usr/bin/env python3
"""Extract text content from the Maid In Malaysia Website PDF."""
import pdfplumber
import sys

PDF_PATH = "/home/z/my-project/upload/Maid In Malaysia Website.pdf"
OUT_PATH = "/home/z/my-project/scripts/pdf_content.txt"

def main():
    all_text = []
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"Total pages: {len(pdf.pages)}", file=sys.stderr)
        for i, page in enumerate(pdf.pages, 1):
            print(f"--- Extracting page {i} ---", file=sys.stderr)
            text = page.extract_text() or ""
            all_text.append(f"\n\n========== PAGE {i} ==========\n\n{text}")
    content = "".join(all_text)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\nSaved {len(content)} chars to {OUT_PATH}", file=sys.stderr)

if __name__ == "__main__":
    main()
