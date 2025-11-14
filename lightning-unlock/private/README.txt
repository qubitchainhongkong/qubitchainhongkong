Qubit Chain Hong Kong - Private Files Directory
================================================

This directory contains the actual downloadable files that users can access after payment.

IMPORTANT SECURITY NOTES:
-------------------------

1. FILE NAMING:
   - Use obfuscated filenames (random hashes/IDs)
   - DO NOT use predictable names like "product.pdf"
   - Example: ai_art_pack_01_f8a3c9d2.zip

2. FILE PROTECTION:
   - These files are NOT linked directly in HTML
   - Links are only revealed by JavaScript after payment confirmation
   - This provides basic protection against direct access

3. LIMITATIONS (GitHub Pages):
   - GitHub Pages serves all files publicly if URL is known
   - This system provides obfuscation, not true encryption
   - For high-value content, consider:
     a) Using encrypted files with key delivery after payment
     b) Implementing proper backend with authentication
     c) Using signed URLs with expiration

4. RECOMMENDED SETUP:
   - Keep filenames unpredictable
   - Don't list files in any public directory index
   - Consider adding .htaccess (if not on GitHub Pages)
   - For better security, use a proper backend or CDN with authentication

ADDING NEW FILES:
-----------------

1. Generate a random filename:
   Example: product_name_a1b2c3d4.ext

2. Place file in this directory

3. Update config.js with product info:
   {
     id: 'product-id',
     name: 'Product Name',
     fileUrl: 'private/product_name_a1b2c3d4.ext',
     price: 200
   }

4. The file will be accessible after payment through the unlock system

SAMPLE FILES:
-------------

This directory includes placeholder text files for demonstration.
Replace these with your actual digital products:
- PDF documents
- ZIP archives
- Images
- Audio files
- Any digital content you want to sell

