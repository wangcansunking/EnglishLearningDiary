from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Create gradient effect by drawing multiple rectangles
    for i in range(size):
        # Calculate color for this row
        ratio = i / size
        r = int(102 + (118 - 102) * ratio)  # 667eea to 764ba2
        g = int(126 + (75 - 126) * ratio)
        b = int(234 + (162 - 234) * ratio)

        # Draw horizontal line
        draw.rectangle([(0, i), (size, i)], fill=(r, g, b, 255))

    # Draw rounded rectangle mask
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = int(size * 0.1875)
    mask_draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=255)

    # Apply mask
    img.putalpha(mask)

    # Draw text 'E'
    try:
        font_size = int(size * 0.625)
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

    # Get text size and position
    text = "E"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (size - text_width) // 2
    y = int(size * 0.65 - text_height // 2)

    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

    # Draw curved underline (approximated with arc)
    y_curve = int(size * 0.82)
    x_start = int(size * 0.25)
    x_end = int(size * 0.75)
    draw.arc([(x_start, y_curve - 10), (x_end, y_curve + 10)],
             start=200, end=340, fill=(255, 255, 255, 255), width=int(size * 0.03125))

    # Save image
    img.save(filename, 'PNG')
    print(f'Created {filename}')

# Create icons directory if it doesn't exist
icons_dir = os.path.dirname(os.path.abspath(__file__))

# Create icons
create_icon(16, os.path.join(icons_dir, 'icon16.png'))
create_icon(48, os.path.join(icons_dir, 'icon48.png'))
create_icon(128, os.path.join(icons_dir, 'icon128.png'))

print('All PNG icons created successfully!')
