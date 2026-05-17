#!/usr/bin/env python3
"""Quick check of iolite crystal record structure"""

import requests
import json

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

response = requests.get(f"{BASE_URL}/crystals/deep", timeout=10)
crystals = response.json()

# Find iolite
iolite = None
for crystal in crystals:
    if crystal.get('id') == 'iolite':
        iolite = crystal
        break

if iolite:
    print("IOLITE CRYSTAL RECORD:")
    print(json.dumps(iolite, indent=2))
else:
    print("Iolite not found")
