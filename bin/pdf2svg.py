#!/usr/bin/env python3
import os
import argparse
import subprocess
import shutil
from PyPDF2 import PdfReader
import math
import xml.etree.ElementTree as ET
import re

def get_total_pages(pdf_file):
    reader = PdfReader(pdf_file)
    return len(reader.pages)

def rotate_pdf(input_file, total_pages, output_file):
    subprocess.run(['pdftk', input_file, 'cat', f'1-{total_pages}east', 'output', output_file], check=True)

def create_output_directory(input_file, cleanup):
    output_dir = os.path.splitext(input_file)[0]
    if os.path.exists(output_dir):
        if cleanup:
            shutil.rmtree(output_dir)
        else:
            raise ValueError(f"Output directory '{output_dir}' already exists. Use --cleanup to overwrite.")
    os.makedirs(output_dir)
    return output_dir

def convert_pdf_to_svg(input_file, total_pages, output_dir):
    padding = math.floor(math.log10(total_pages)) + 1
    
    for i in range(1, total_pages + 1):
        output_svg = os.path.join(output_dir, f"{i:0{padding}d}.svg")
        print(f"Converting page {i} to SVG.")
        subprocess.run(['pdf2svg', input_file, output_svg, str(i)], check=True)

def extract_pages(args):
    input_file = args.input_file
    total_pages = get_total_pages(input_file)

    try:
        output_dir = create_output_directory(input_file, args.cleanup)
    except ValueError as e:
        print(str(e))
        return

    if args.rotate:
        rotated_file = os.path.join(output_dir, f"rotated_{os.path.basename(input_file)}")
        rotate_pdf(input_file, total_pages, rotated_file)
        convert_pdf_to_svg(rotated_file, total_pages, output_dir)
        os.remove(rotated_file)  # Clean up rotated file
    else:
        convert_pdf_to_svg(input_file, total_pages, output_dir)

    print(f"All pages have been converted to SVG files in '{output_dir}'.")

def get_svg_dimensions(file_path):
    tree = ET.parse(file_path)
    root = tree.getroot()
    viewbox = root.get('viewBox')
    if viewbox:
        _, _, width, height = map(float, viewbox.split())
    else:
        width = float(root.get('width', '0').rstrip('px'))
        height = float(root.get('height', '0').rstrip('px'))
    return width, height

def merge_svgs(args):
    input_dir = args.input_dir
    output_file = args.output_file
    exclude_files = set(args.exclude) if args.exclude else set()

    # Sort SVG files by name
    svg_files = sorted([f for f in os.listdir(input_dir) if f.endswith('.svg') and f not in exclude_files])

    if not svg_files:
        print("No SVG files found to merge.")
        return

    # First pass: check dimensions and count files
    width, height = get_svg_dimensions(os.path.join(input_dir, svg_files[0]))
    num_files = 0
    for svg_file in svg_files:
        file_path = os.path.join(input_dir, svg_file)
        file_width, file_height = get_svg_dimensions(file_path)
        if file_width != width or file_height != height:
            print(f"Error: File {svg_file} has different dimensions. Skipping merge.")
            return
        num_files += 1

    # Create new SVG
    new_svg = ET.Element('svg', {
        'xmlns': 'http://www.w3.org/2000/svg',
        'viewBox': f'0 0 {width} {height * num_files}',
        'width': str(width),
        'height': str(height * num_files)
    })

    # Second pass: add groups and frames
    for i, svg_file in enumerate(svg_files):
        file_path = os.path.join(input_dir, svg_file)
        tree = ET.parse(file_path)
        root = tree.getroot()

        group = ET.SubElement(new_svg, 'g', {'transform': f'translate(0, {i * height})'})
        
        # Add gray frame
        ET.SubElement(group, 'rect', {
            'x': '0',
            'y': '0',
            'width': str(width),
            'height': str(height),
            'fill': 'none',
            'stroke': 'gray',
            'stroke-width': '1'
        })

        # Add elements from original SVG
        for child in root:
            # Skip the root SVG tag and only copy its children
            if child.tag != '{http://www.w3.org/2000/svg}svg':
                group.append(child)
            else:
                # If we encounter a nested SVG, we need to copy its children
                for nested_child in child:
                    group.append(nested_child)

    # Write the combined SVG to a file
    tree = ET.ElementTree(new_svg)
    tree.write(output_file, encoding='unicode', xml_declaration=True)
    print(f"Merged SVG written to {output_file}")

def main():
    parser = argparse.ArgumentParser(description='PDF to SVG conversion and SVG merging tool.')
    subparsers = parser.add_subparsers(dest='command', required=True)

    # Extract pages subcommand
    extract_parser = subparsers.add_parser('extract-pages', help='Extract pages from PDF to SVG')
    extract_parser.add_argument('--input-file', required=True, help='Input PDF file')
    extract_parser.add_argument('--rotate', action='store_true', help='Rotate the PDF pages before converting to SVG')
    extract_parser.add_argument('--cleanup', action='store_true', help='Clean up existing output directory')
    extract_parser.set_defaults(func=extract_pages)

    # Merge subcommand
    merge_parser = subparsers.add_parser('merge', help='Merge SVG files')
    merge_parser.add_argument('--input-dir', required=True, help='Input directory containing SVG files')
    merge_parser.add_argument('--output-file', required=True, help='Output SVG file')
    merge_parser.add_argument('--exclude', nargs='*', help='SVG files to exclude from merging')
    merge_parser.set_defaults(func=merge_svgs)

    args = parser.parse_args()
    args.func(args)

if __name__ == '__main__':
    main()
