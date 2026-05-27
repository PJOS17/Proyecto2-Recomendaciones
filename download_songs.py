# =============================================================================
# download_songs.py - Descargador de Canciones Demo desde SoundHelix
# =============================================================================
# PROPÓSITO: Descarga canciones de demostración libres de derechos de autor
# desde SoundHelix para usar como audio de prueba en la aplicación VIBES.
# FUNCIONA:
#   1. Define un diccionario con nombres de archivo y sus URLs de descarga
#   2. Para cada canción, verifica si ya existe en la carpeta de salida
#   3. Si no existe, la descarga y la guarda
# NOTA: Estas canciones son generadas por SoundHelix y son completamente
# libres de derechos, perfectas para pruebas y desarrollo.
# =============================================================================

import os              # Módulo para operaciones del sistema de archivos
import urllib.request  # Módulo para descargar archivos desde URLs

# ---- DICCIONARIO DE CANCIONES DEMO ----
# Clave: nombre del archivo de salida
# Valor: URL de descarga directa desde SoundHelix
songs = {
    "synaptic_echoes.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",        # Canción demo 1
    "neon_protocol.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",           # Canción demo 2
    "ghost_in_the_stack.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",      # Canción demo 3
    "signal_drift.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",            # Canción demo 4
    "pulse_architecture.mp3": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"       # Canción demo 5
}

# ---- DIRECTORIO DE SALIDA ----
output_dir = "audio"                    # Carpeta donde se guardarán los MP3
os.makedirs(output_dir, exist_ok=True)  # Crea la carpeta si no existe

# Mensaje de inicio
print("--- Descargando canciones demo de SoundHelix (libres de derechos) ---")

# ---- BUCLE DE DESCARGA ----
# Recorre cada canción del diccionario
for filename, url in songs.items():
    # Construye la ruta completa del archivo de destino
    dest_path = os.path.join(output_dir, filename)

    # Verifica si el archivo ya fue descargado previamente
    if os.path.exists(dest_path):
        print(f"OK: {filename} ya existe. Saltando...")
        continue  # Salta a la siguiente canción

    # Intenta descargar la canción
    print(f"Descargando {filename} desde {url}...")
    try:
        # urllib.request.urlretrieve descarga el archivo de la URL y lo guarda en dest_path
        urllib.request.urlretrieve(url, dest_path)
        print(f"OK: Descargado {filename} con exito.")
    except Exception as e:
        # Manejo de errores: problemas de red, URL caída, etc.
        print(f"Error al descargar {filename}: {e}")

# Mensaje final
print("--- Descarga de catalogo musical finalizada! ---")
