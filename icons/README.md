# Icons

This folder contains the extension icons in SVG format. The manifest.json references PNG versions.

## Converting SVG to PNG

To convert these SVG files to PNG format for use in the extension:

### Using Online Tools:
1. Visit https://svgtopng.com/ or https://cloudconvert.com/svg-to-png
2. Upload each SVG file
3. Download the PNG versions
4. Replace the SVG files with PNG files of the same name

### Using ImageMagick (command line):
```bash
# Install ImageMagick first
# On macOS: brew install imagemagick
# On Windows: Download from https://imagemagick.org/

convert icon16.svg icon16.png
convert icon48.svg icon48.png
convert icon128.svg icon128.png
```

### Using Inkscape (command line):
```bash
# Install Inkscape first
inkscape icon16.svg --export-filename=icon16.png -w 16 -h 16
inkscape icon48.svg --export-filename=icon48.png -w 48 -h 48
inkscape icon128.svg --export-filename=icon128.png -w 128 -h 128
```

## Icon Sizes

- **icon16.png** - Shown in the extension toolbar
- **icon48.png** - Shown in the extension management page
- **icon128.png** - Shown during installation and in the Chrome Web Store

## Custom Design

Feel free to replace these placeholder icons with your own custom design. Just make sure to maintain the same dimensions and file names.
