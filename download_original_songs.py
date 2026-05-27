# =============================================================================
# download_original_songs.py - Descargador de Canciones Originales desde Deezer
# =============================================================================
# PROPÓSITO: Descarga automáticamente previews de canciones reales desde la API
# de Deezer para usarlas en la aplicación VIBES.
# FUNCIONA:
#   1. Define una lista de canciones deseadas (título, artista, nombre de archivo)
#   2. Para cada canción, busca en la API de Deezer usando el nombre del artista y título
#   3. Obtiene la URL de preview del primer resultado
#   4. Descarga el archivo MP3 y lo guarda en la carpeta "audio/"
# NOTA: Los previews de Deezer duran aproximadamente 30 segundos.
# =============================================================================

import os              # Módulo para operaciones del sistema de archivos (crear carpetas, verificar archivos)
import json            # Módulo para parsear respuestas JSON de la API de Deezer
import urllib.request  # Módulo para hacer peticiones HTTP y descargar archivos
import urllib.parse    # Módulo para codificar URLs (manejar caracteres especiales como espacios y apóstrofes)

# ---- LISTA DE CANCIONES A DESCARGAR ----
# Cada tupla contiene: (título de la canción, nombre del artista, nombre del archivo de salida)
songs_to_fetch = [
    ("Sweet Child O' Mine", "Guns N' Roses", "sweet_child_o_mine.mp3"),  # Rock clásico
    ("In The End", "Linkin Park", "in_the_end.mp3"),                     # Rock alternativo/Nu Metal
    ("Monster", "Skillet", "monster.mp3"),                                # Rock cristiano
    ("Get Lucky", "Daft Punk", "get_lucky.mp3"),                          # Electrónica/Dance
    ("Blinding Lights", "The Weeknd", "blinding_lights.mp3"),             # Pop/Synthwave
    ("Moscow Mule", "Bad Bunny", "moscow_mule.mp3"),                      # Reggaetón/Latino
    ("Viva La Vida", "Coldplay", "viva_la_vida.mp3"),                     # Pop/Rock alternativo
    ("Bohemian Rhapsody", "Queen", "bohemian_rhapsody.mp3"),              # Rock clásico
    ("One More Time", "Daft Punk", "one_more_time.mp3")                   # Electrónica/House
]

# ---- DIRECTORIO DE SALIDA ----
output_dir = "audio"                    # Carpeta donde se guardarán los archivos MP3
os.makedirs(output_dir, exist_ok=True)  # Crea la carpeta si no existe; exist_ok=True evita error si ya existe

# Mensaje de inicio en la consola
print("--- Descargando canciones originales de alta fidelidad desde Deezer CDN ---")

# ---- BUCLE DE DESCARGA ----
# Recorre cada canción de la lista y la descarga
for title, artist, filename in songs_to_fetch:
    # Construye la ruta completa del archivo de destino (ej: "audio/sweet_child_o_mine.mp3")
    dest_path = os.path.join(output_dir, filename)
    
    # Verifica si el archivo ya existe Y tiene un tamaño mayor a 10KB (para evitar archivos corruptos/vacíos)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 10000:
        print(f"OK: {filename} ya existe y tiene tamaño válido. Saltando...")
        continue  # Salta a la siguiente canción si ya está descargada
        
    # Construye la cadena de búsqueda combinando artista y título
    query = f"{artist} {title}"
    # Construye la URL de la API de Deezer con la búsqueda codificada (urllib.parse.quote maneja caracteres especiales)
    url = f"https://api.deezer.com/search?q={urllib.parse.quote(query)}"
    
    try:
        # Crea una petición HTTP con un User-Agent de navegador (algunas APIs bloquean peticiones sin User-Agent)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        # Abre la conexión y lee la respuesta
        with urllib.request.urlopen(req) as response:
            # Decodifica la respuesta de bytes a string y la parsea como JSON
            data = json.loads(response.read().decode())
            # Verifica si hay resultados en la respuesta
            if data.get("data") and len(data["data"]) > 0:
                track = data["data"][0]         # Toma el primer resultado (más relevante)
                preview_url = track["preview"]  # Obtiene la URL del preview MP3 de 30 segundos
                print(f"Descargando original: '{artist} - {title}' => {filename}...")
                
                # Descarga el archivo MP3 desde la URL del preview y lo guarda en dest_path
                urllib.request.urlretrieve(preview_url, dest_path)
                print(f"OK: Descargado {filename} con éxito!")
            else:
                # No se encontraron resultados para esta búsqueda
                print(f"No se encontró coincidencia en API para: {query}")
    except Exception as e:
        # Manejo de errores: conexión fallida, URL inválida, etc.
        print(f"Error al descargar {query}: {e}")

# Mensaje final
print("--- Descarga de catálogo original finalizada! ---")
