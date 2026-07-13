import urllib.request
import re
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}

def get_unsplash_photo_ids(query, limit=15):
    url = f"https://unsplash.com/s/photos/{urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            # Find photo IDs in the format photo-xxxxxxxxx
            # Unsplash image source URLs look like: https://images.unsplash.com/photo-1584917865442-de89df76afd3?...
            matches = re.findall(r'images\.unsplash\.com/(photo-[a-zA-Z0-9\-]+)', html)
            unique_ids = list(dict.fromkeys(matches))  # remove duplicates
            return unique_ids[:limit]
    except Exception as e:
        print(f"Error fetching {query}: {e}")
        return []

# Test with handbag
ids = get_unsplash_photo_ids("handbag", 5)
print("Handbag IDs found:", ids)
