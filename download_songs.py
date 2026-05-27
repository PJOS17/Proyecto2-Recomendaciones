import os
import urllib.request

songs = {
    "synaptic_echoes.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "neon_protocol.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "ghost_in_the_stack.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "signal_drift.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "pulse_architecture.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
}

output_dir = "audio"
os.makedirs(output_dir, exist_ok=True)

print("--- Descargando canciones demo de SoundHelix (libres de derechos) ---")

for filename, url in songs.items():
    dest_path = os.path.join(output_dir, filename)
    if os.path.exists(dest_path):
        print(f"OK: {filename} ya existe. Saltando...")
        continue
    
    print(f"Descargando {filename} desde {url}...")
    try:
        urllib.request.urlretrieve(url, dest_path)
        print(f"OK: Descargado {filename} con exito.")
    except Exception as e:
        print(f"Error al descargar {filename}: {e}")

print("--- Descarga de catalogo musical finalizada! ---")
