#!/usr/bin/env python3
import os
import xml.etree.ElementTree as ET
from typing import List, Tuple

def sort_svg_files(directory: str) -> List[str]:
    return sorted([f for f in os.listdir(directory) if f.endswith('.svg')])

def parse_svg(file_path: str) -> Tuple[ET.Element, float, float]:
    tree = ET.parse(file_path)
    root = tree.getroot()
    width = float(root.get('width', '0'))
    height = float(root.get('height', '0'))
    return root, width, height

def create_combined_svg(total_height: float, max_width: float) -> ET.Element:
    svg = ET.Element('svg', {
        'xmlns': 'http://www.w3.org/2000/svg',
        'viewBox': f'0 0 {max_width} {total_height}',
        'width': str(max_width),
        'height': str(total_height)
    })
    return svg

def add_frame(group: ET.Element, width: float, height: float) -> None:
    frame = ET.SubElement(group, 'rect', {
        'x': '0',
        'y': '0',
        'width': str(width),
        'height': str(height),
        'fill': 'none',
        'stroke': 'gray',
        'stroke-width': '1'
    })

def combine_svgs(directory: str, output_file: str) -> None:
    svg_files = sort_svg_files(directory)
    total_height = 0
    max_width = 0

    # First pass: determine overall viewBox
    for file in svg_files:
        _, width, height = parse_svg(os.path.join(directory, file))
        total_height += height
        max_width = max(max_width, width)

    # Create the combined SVG
    combined_svg = create_combined_svg(total_height, max_width)

    # Second pass: add content
    y_offset = 0
    for file in svg_files:
        root, width, height = parse_svg(os.path.join(directory, file))
        
        # Create a group for this page
        group = ET.SubElement(combined_svg, 'g', {
            'transform': f'translate(0, {y_offset})'
        })

        # Add frame
        add_frame(group, width, height)

        # Add all elements from the original SVG
        for child in root:
            group.append(child)

        y_offset += height

    # Write the combined SVG to file
    tree = ET.ElementTree(combined_svg)
    tree.write(output_file, encoding='unicode', xml_declaration=True)

if __name__ == "__main__":
    input_directory = "path/to/your/svg/files"
    output_file = "combined_output.svg"
    combine_svgs(input_directory, output_file)

