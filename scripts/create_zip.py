import zipfile
import os

exclude_dirs = {'node_modules', '.git', 'dist', '.aistudio', '__pycache__', '.vite'}
exclude_files = {'rehlati_project_source.zip'}

output_zip = os.path.join('public', 'rehlati_project_source.zip')

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
        for file in files:
            if file in exclude_files or file.endswith('.pyc'):
                continue
            filepath = os.path.join(root, file)
            # relative path inside zip
            arcname = os.path.relpath(filepath, '.')
            zipf.write(filepath, arcname)

print(f"Archive successfully generated at {output_zip} ({os.path.getsize(output_zip)} bytes)")
