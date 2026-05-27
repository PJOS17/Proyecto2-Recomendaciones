import os
import json
import urllib.request
import urllib.parse

songs_to_fetch = [
    ("Sweet Child O' Mine", "Guns N' Roses", "sweet_child_o_mine.mp3"),
    ("In The End", "Linkin Park", "in_the_end.mp3"),
    ("Monster", "Skillet", "monster.mp3"),
    ("Get Lucky", "Daft Punk", "get_lucky.mp3"),
    ("Blinding Lights", "The Weeknd", "blinding_lights.mp3"),
    ("Moscow Mule", "Bad Bunny", "moscow_mule.mp3"),
    ("Viva La Vida", "Coldplay", "viva_la_vida.mp3"),
    ("Bohemian Rhapsody", "Queen", "bohemian_rhapsody.mp3"),
    ("One More Time", "Daft Punk", "one_more_time.mp3")
]

output_dir = "audio"
os.makedirs(output_dir, exist_ok=True)

print("--- Descargando canciones originales de alta fidelidad desde Deezer CDN ---")

for title, artist, filename in songs_to_fetch:
    dest_path = os.path.join(output_dir, filename)
    
    # Si ya existe, omitir
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 10000:
        print(f"OK: {filename} ya existe y tiene tamaño válido. Saltando...")
        continue
        
    query = f"{artist} {title}"
    url = f"https://api.deezer.com/search?q={urllib.parse.quote(query)}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data.get("data") and len(data["data"]) > 0:
                track = data["data"][0]
                preview_url = track["preview"]
                print(f"Descargando original: '{artist} - {title}' => {filename}...")
                
                # Descargar
                urllib.request.urlretrieve(preview_url, dest_path)
                print(f"OK: Descargado {filename} con éxito!")
            else:
                print(f"No se encontró coincidencia en API para: {query}")
    except Exception as e:
        print(f"Error al descargar {query}: {e}")

print("--- Descarga de catálogo original finalizada! ---")
