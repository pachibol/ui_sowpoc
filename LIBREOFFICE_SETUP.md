# LibreOffice Setup for DOCX to PDF Conversion

This application uses LibreOffice to convert DOCX files to PDF with high fidelity, preserving all styles, formatting, and layout.

## Installation

### Ubuntu/Debian
\`\`\`bash
sudo apt update
sudo apt install libreoffice
\`\`\`

### CentOS/RHEL/Fedora
\`\`\`bash
# CentOS/RHEL
sudo yum install libreoffice

# Fedora
sudo dnf install libreoffice
\`\`\`

### macOS
\`\`\`bash
# Using Homebrew
brew install --cask libreoffice

# Or download from: https://www.libreoffice.org/download/download/
\`\`\`

### Windows
1. Download LibreOffice from: https://www.libreoffice.org/download/download/
2. Install the downloaded package
3. Add LibreOffice to your system PATH:
   - Add `C:\Program Files\LibreOffice\program` to your PATH environment variable

### Docker
If running in Docker, add to your Dockerfile:
\`\`\`dockerfile
RUN apt-get update && apt-get install -y libreoffice
\`\`\`

## Verification

To verify LibreOffice is properly installed and accessible:
\`\`\`bash
libreoffice --version
\`\`\`

You should see output similar to:
\`\`\`
LibreOffice 7.x.x.x
\`\`\`

## Features

- **High Fidelity**: Preserves all original formatting, styles, and layout
- **Fast Conversion**: Direct conversion without intermediate steps
- **Reliable**: Uses the same engine as LibreOffice desktop application
- **Format Support**: Supports all LibreOffice-compatible formats

## Troubleshooting

### LibreOffice not found
- Ensure LibreOffice is installed
- Verify it's in your system PATH
- Try running `which libreoffice` (Linux/macOS) or `where libreoffice` (Windows)

### Permission issues
- Ensure the application has write permissions to the `docs/converted_to_pdf` directory
- Check that LibreOffice can access the input DOCX files

### Conversion fails
- Check that the DOCX file is not corrupted
- Verify the file is a valid DOCX format
- Check system resources (disk space, memory)
\`\`\`

Actualizo el componente de selección de propuestas para usar la nueva conversión:
