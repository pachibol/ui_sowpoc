# LibreOffice Setup for DOCX to PDF Conversion

This application uses LibreOffice to convert DOCX files to PDF with high fidelity, preserving all styles, formatting, and layout. It automatically detects LibreOffice installation on your system and uses the appropriate path for conversion.

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
# Option 1: Using Homebrew (Recommended)
brew install --cask libreoffice

# Option 2: Download from official website
# Visit: https://www.libreoffice.org/download/download/
# Download the macOS version and install normally
\`\`\`

### Windows
1. Download LibreOffice from: https://www.libreoffice.org/download/download/
2. Run the installer as Administrator
3. Follow the installation wizard

### Docker
If running in Docker, add to your Dockerfile:
\`\`\`dockerfile
RUN apt-get update && apt-get install -y libreoffice
\`\`\`

## Automatic Detection

The application will automatically search for LibreOffice in these locations:

### macOS
- `/Applications/LibreOffice.app/Contents/MacOS/soffice` (Standard installation)
- `/usr/local/bin/libreoffice` (Homebrew)
- `/opt/homebrew/bin/libreoffice` (Apple Silicon Homebrew)
- `/usr/bin/libreoffice` (System installation)

### Linux
- `/usr/bin/libreoffice` (Package manager)
- `/usr/local/bin/libreoffice` (Manual installation)
- `/opt/libreoffice/program/soffice` (Custom installation)
- `/snap/bin/libreoffice` (Snap package)

### Windows
- `C:\Program Files\LibreOffice\program\soffice.exe`
- `C:\Program Files (x86)\LibreOffice\program\soffice.exe`
- `%USERPROFILE%\AppData\Local\Programs\LibreOffice\program\soffice.exe`

## Verification

To verify LibreOffice is properly installed and accessible:
\`\`\`bash
libreoffice --version
\`\`\`

You should see output similar to:
\`\`\`
LibreOffice 7.x.x.x
\`\`\`

You can also check if LibreOffice is properly detected by visiting:
\`\`\`
http://localhost:3000/api/libreoffice-status
\`\`\`

This will show:
- Whether LibreOffice is detected
- The path being used
- The version information
- Your operating system

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

### macOS Issues

**Problem**: "libreoffice: command not found"
**Solution**: The application will automatically find LibreOffice even if it's not in PATH.

**Problem**: LibreOffice installed but not detected
**Solutions**:
1. Reinstall using Homebrew: `brew install --cask libreoffice`
2. Check if installed in Applications folder
3. Restart the development server

### Linux Issues

**Problem**: Permission denied
**Solution**: 
\`\`\`bash
sudo chmod +x /usr/bin/libreoffice
\`\`\`

**Problem**: LibreOffice not found after installation
**Solution**:
\`\`\`bash
# Find LibreOffice installation
which libreoffice
find /usr -name "soffice" 2>/dev/null
\`\`\`

### Windows Issues

**Problem**: LibreOffice not detected
**Solutions**:
1. Reinstall LibreOffice as Administrator
2. Check installation path matches expected locations
3. Restart the application

### General Issues

**Problem**: Conversion fails with timeout
**Solution**: Increase timeout in the code or check system resources

**Problem**: PDF not created
**Solutions**:
1. Check DOCX file is not corrupted
2. Verify write permissions to output directory
3. Check available disk space

## Features

- **Automatic Detection**: Finds LibreOffice on any supported OS
- **High Fidelity**: Preserves all original formatting and styles
- **Cross-Platform**: Works on macOS, Linux, and Windows
- **Caching**: Remembers LibreOffice location for better performance
- **Error Handling**: Provides detailed error messages and solutions

## API Endpoints

- `POST /api/convert-to-pdf` - Convert DOCX to PDF
- `GET /api/libreoffice-status` - Check LibreOffice status and detection
