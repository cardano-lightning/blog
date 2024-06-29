#!/usr/bin/env python3
import argparse
import xml.etree.ElementTree as ET
from subprocess import call

def parse_args():
    parser = argparse.ArgumentParser(description='Resize SVG and add margins.')
    parser.add_argument('--size', type=int, help='Size to which both the width and height of the SVG should be set.', required=True)
    parser.add_argument('--margin', type=float, help='Margin as a percentage of the new size.', default=0)
    return parser.parse_args()

def modify_svg(svg_path, size, margin_percentage):
    tree = ET.parse(svg_path)
    root = tree.getroot()
    width, height = size, size
    margin = size * (margin_percentage / 100) / 2

    # Adjust the viewbox to include margins if margin is specified
    if 'viewBox' in root.attrib:
        viewbox = list(map(float, root.attrib['viewBox'].split()))
        viewbox[0] -= margin / 2  # x
        viewbox[1] -= margin / 2  # y
        viewbox[2] += margin      # width
        viewbox[3] += margin      # height
        root.attrib['viewBox'] = ' '.join(map(str, viewbox))

    # Update width and height attributes
    root.attrib['width'] = str(width + margin)
    root.attrib['height'] = str(height + margin)

    # Save the modified SVG
    modified_svg_path = f'./tmp_modified_logo.svg'
    tree.write(modified_svg_path)
    return modified_svg_path

def main():
    args = parse_args()
    modified_svg_path = modify_svg('./public/logo.svg', args.size, args.margin)

    # Run inkscape command to generate the PNG
    output_filename = f'logo-{args.size}.png'
    call(['inkscape', '-w', str(args.size), '-h', str(args.size), '-o', output_filename, modified_svg_path])

    print(f"Generated {output_filename} with size {args.size} and margin {args.margin}%")

if __name__ == "__main__":
    main()

