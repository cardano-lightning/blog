#!/usr/bin/env python3
import os
import argparse
import subprocess
from PyPDF2 import PdfReader

def get_total_pages(pdf_file):
    # Read the PDF file and get the total number of pages
    reader = PdfReader(pdf_file)
    return len(reader.pages)

def rotate_pdf(input_file, total_pages, output_file):
    # Rotate the PDF pages
    subprocess.run(['pdftk', input_file, 'cat', f'1-{total_pages}east', 'output', output_file], check=True)

def convert_pdf_to_svg(input_file, total_pages):
    # Loop through all pages of the PDF and convert to SVG
    for i in range(1, total_pages + 1):
        output_svg = f"{i}.svg"
        print(f"Converting page {i} to SVG.")
        subprocess.run(['pdf2svg', input_file, output_svg, str(i)], check=True)

def main():
    parser = argparse.ArgumentParser(description='Convert PDF pages to SVG files, optionally rotating the pages.')
    parser.add_argument('--input-file', required=True, help='Input PDF file')
    parser.add_argument('--rotate', action='store_true', help='Rotate the PDF pages before converting to SVG')
    args = parser.parse_args()

    input_file = args.input_file
    total_pages = get_total_pages(input_file)

    if args.rotate:
        rotated_file = f"rotated_{os.path.basename(input_file)}"
        rotate_pdf(input_file, total_pages, rotated_file)
        convert_pdf_to_svg(rotated_file, total_pages)
        os.remove(rotated_file)  # Clean up rotated file
    else:
        convert_pdf_to_svg(input_file, total_pages)

    print("All pages have been converted to SVG files.")

if __name__ == '__main__':
    main()

