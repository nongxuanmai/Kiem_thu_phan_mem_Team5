import urllib.request
import os
import time

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)

categories_config = [
    # (id_dm, keyword, count, start_id)
    (1, "handbag", 14, 1),
    (2, "crossbody,bag", 14, 15),
    (3, "shoulder,bag", 13, 29),
    (4, "backpack", 13, 42),
    (5, "wallet", 12, 55),
    (6, "clutch,bag", 12, 67)
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}

print("Starting image downloads...")
for id_dm, keyword, count, start_id in categories_config:
    print(f"Downloading {count} images for category {id_dm} (keyword: {keyword})...")
    for i in range(count):
        img_id = start_id + i
        # Use loremflickr with seed to get different images
        url = f"https://loremflickr.com/500/500/{urllib.parse.quote(keyword)}?lock={img_id}"
        dest_path = os.path.join(uploads_dir, f"sp_{img_id}.jpg")
        
        success = False
        for attempt in range(3):
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=15) as response:
                    data = response.read()
                    with open(dest_path, "wb") as f:
                        f.write(data)
                print(f" Saved sp_{img_id}.jpg")
                success = True
                break
            except Exception as e:
                print(f" Attempt {attempt+1} failed for sp_{img_id}.jpg: {e}")
                time.sleep(1)
        if not success:
            print(f"Failed to download image for sp_{img_id}.jpg")
            
print("All downloads completed.")
