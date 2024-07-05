#!/usr/bin/env python3

import argparse
import os

def invert_colors_in_svg(content):
    # Replace colors
    content = content.replace('fill="#000000"', 'fill="#FFFFFF"')
    content = content.replace('fill="#ffffff"', 'fill="#000000"')
    content = content.replace('stroke="#000000"', 'stroke="#FFFFFF"')
    content = content.replace('stroke="#ffffff"', 'stroke="#000000"')
    
    # Handle rgb colors
    content = content.replace('fill="rgb(0,0,0)"', 'fill="rgb(255,255,255)"')
    content = content.replace('fill="rgb(255,255,255)"', 'fill="rgb(0,0,0)"')
    content = content.replace('stroke="rgb(0,0,0)"', 'stroke="rgb(255,255,255)"')
    content = content.replace('stroke="rgb(255,255,255)"', 'stroke="rgb(0,0,0)"')
    
    return content

def process_file(input_file, output_file):
    # Read the SVG file content
    with open(input_file, 'r', encoding='utf-8') as file:
        content = file.read()

    # Invert colors
    inverted_content = invert_colors_in_svg(content)

    # Write the modified content to the output file
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(inverted_content)

def process_directory(input_dir, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for filename in os.listdir(input_dir):
        if filename.endswith('.svg'):
            input_file = os.path.join(input_dir, filename)
            output_file = os.path.join(output_dir, filename)
            process_file(input_file, output_file)

def main():
    parser = argparse.ArgumentParser(description='Invert colors of SVG files.')
    parser.add_argument('--input', help='Input SVG file')
    parser.add_argument('--output', help='Output SVG file')
    parser.add_argument('--input-dir', help='Input directory containing SVG files')
    parser.add_argument('--output-dir', help='Output directory for modified SVG files')
    args = parser.parse_args()

    if args.input and args.output:
        process_file(args.input, args.output)
    elif args.input_dir and args.output_dir:
        process_directory(args.input_dir, args.output_dir)
    else:
        parser.error('You must specify either --input and --output or --input-dir and --output-dir.')

if __name__ == '__main__':
    main()
