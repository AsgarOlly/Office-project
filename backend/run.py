import os
import sys

# Ensure root directory is in sys.path so 'backend' package can be imported from anywhere
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 ThreadCraft Luxe Flask REST API starting on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
