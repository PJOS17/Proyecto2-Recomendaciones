import os
import json
import sys
import uuid
import unicodedata
from flask import Flask, request, jsonify, send_from_directory
from neo4j import GraphDatabase

# Asegurar codificación utf-8 para salida en terminal Windows
sys.stdout.reconfigure(encoding='utf-8')

def remove_accents(input_str):
    if not input_str:
        return ""
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return u"".join([c for c in nfkd_form if not unicodedata.combining(c)])


app = Flask(__name__, static_folder='.', static_url_path='')

# === CREDENCIALES NEO4J (AuraDB y Localhost Fallback) ===
URI_AURA = "neo4j+s://d544acc5.databases.neo4j.io"
USER_AURA = "d544acc5"
PASSWORD_AURA = "3JdyXlKfIxftHD0U9-jMTni7_DWovV10M2TNscwVU1k"

URI_LOCAL = "neo4j://localhost:7687"
USER_LOCAL = "neo4j"
PASSWORD_LOCAL = "password"  # Ajustar a las credenciales locales típicas

NEO4J_ENABLED = False
driver = None

# Intentar conectar a AuraDB primero, luego a Localhost
try:
    print("Connecting to Neo4j AuraDB...")
    driver = GraphDatabase.driver(URI_AURA, auth=(USER_AURA, PASSWORD_AURA))
    # Validar conexión
    with driver.session() as session:
        session.run("RETURN 1")
    NEO4J_ENABLED = True
    print("Connected successfully to Neo4j AuraDB!")
except Exception as e_aura:
    print(f"Could not connect to Neo4j AuraDB: {e_aura}")
    try:
        print("Attempting connection to local Neo4j (localhost:7687)...")
        driver = GraphDatabase.driver(URI_LOCAL, auth=(USER_LOCAL, PASSWORD_LOCAL))
        with driver.session() as session:
            session.run("RETURN 1")
        NEO4J_ENABLED = True
        print("Connected successfully to local Neo4j!")
    except Exception as e_local:
        print(f"Could not connect to local Neo4j either: {e_local}")
        print("Fallback Mode Enabled: Local JSON database will be used.")
        NEO4J_ENABLED = False
        driver = None

FALLBACK_FILE = "db_fallback.json"

def load_fallback_db():
    if os.path.exists(FALLBACK_FILE):
        try:
            with open(FALLBACK_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"users": [], "genres": [], "artists": [], "moods": [], "songs": [], "playlists": []}

def save_fallback_db(db):
    try:
        with open(FALLBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving fallback DB: {e}")

# === INICIALIZACIÓN Y LIMPIEZA DE BASE DE DATOS ===
def init_database():
    # 1. Limpieza en Fallback JSON (Desactivada para conservar cuentas registradas entre reinicios)
    db = load_fallback_db()
    # db["users"] = []      # Cuentas limpias al iniciar! (Comentado para persistencia)
    # db["playlists"] = []  # Playlists limpias al iniciar! (Comentado para persistencia)
    save_fallback_db(db)
    print("Fallback JSON: Persistencia activa (Cuentas y playlists conservadas).")

    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                print("Limpiando e inicializando grafo Neo4j...")
                # Borrar solo nodos de catálogo, preservando cuentas de usuario y sus playlists
                session.run("MATCH (n) WHERE NOT n:Usuario AND NOT n:Playlist DETACH DELETE n")
                
                # Crear nodos del catálogo base (Sin ningún Usuario registrado!)
                # Cargar géneros
                for genre in db["genres"]:
                    session.run("MERGE (:Genero {nombre: $nombre})", nombre=genre)
                
                # Cargar artistas
                for artist in db["artists"]:
                    session.run("MERGE (:Artista {nombre: $nombre, cover: $cover})", 
                                nombre=artist["name"], cover=artist["cover"])
                
                # Cargar moods
                for mood in db["moods"]:
                    session.run("MERGE (:Mood {nombre: $nombre, cover: $cover})", 
                                nombre=mood["name"], cover=mood["cover"])
                
                # Cargar canciones y sus relaciones
                for song in db["songs"]:
                    session.run("""
                        MERGE (c:Cancion {
                            titulo: $titulo,
                            artista: $artista,
                            genero: $genero,
                            mood: $mood,
                            archivo: $archivo,
                            cover: $cover,
                            lyrics: $lyrics
                        })
                        WITH c
                        MATCH (a:Artista {nombre: $artista})
                        MATCH (g:Genero {nombre: $genero})
                        MATCH (m:Mood {nombre: $mood})
                        MERGE (c)-[:COMPUESTA_POR]->(a)
                        MERGE (c)-[:PERTENECE_A]->(g)
                        MERGE (c)-[:TIENE_MOOD]->(m)
                    """, 
                    titulo=song["title"],
                    artista=song["artist"],
                    genero=song["genre"],
                    mood=song["mood"],
                    archivo=song["file"],
                    cover=song["cover"],
                    lyrics=song["lyrics"]
                    )
                print("Grafo de Neo4j poblado e inicializado exitosamente (Cuentas vacias).")
        except Exception as e:
            print(f"Error initializing Neo4j database: {e}")

init_database()

# === ENDPOINTS DE SERVIDOR ===

# Ruta para servir archivos estáticos del frontend
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Endpoint: Registro de usuario
@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    
    if not username or not password:
        return jsonify({"success": False, "message": "Usuario y contraseña requeridos"}), 400
    
    # Intentar en Neo4j primero
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                # Comprobar si el usuario existe
                res = session.run("MATCH (u:Usuario {nombre: $name}) RETURN u", name=username)
                if list(res):
                    return jsonify({"success": False, "message": "El usuario ya existe"}), 400
                
                # Registrar nuevo usuario
                session.run("CREATE (:Usuario {nombre: $name, password: $password})", 
                            name=username, password=password)
        except Exception as e:
            print(f"Neo4j register error: {e}. Fallback to JSON.")
    
    # Fallback / Sincronización JSON
    db = load_fallback_db()
    for u in db["users"]:
        if u["username"].lower() == username.lower():
            return jsonify({"success": False, "message": "El usuario ya existe"}), 400
            
    db["users"].append({
        "username": username,
        "password": password,
        "genres": [],
        "artists": [],
        "moods": []
    })
    save_fallback_db(db)
    
    return jsonify({"success": True, "message": "Usuario registrado con éxito"})

# Endpoint: Eliminar cuenta de usuario
@app.route('/api/auth/delete_account', methods=['POST'])
def api_delete_account():
    data = request.json
    username = data.get("username", "").strip()
    
    if not username:
        return jsonify({"success": False, "message": "Usuario requerido"}), 400
        
    # Guardar en Neo4j si está activo
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                # Borrar usuario y sus playlists en Neo4j
                session.run("MATCH (u:Usuario {nombre: $name}) DETACH DELETE u", name=username)
                session.run("MATCH (p:Playlist {username: $name}) DETACH DELETE p", name=username)
        except Exception as e:
            print(f"Neo4j delete user error: {e}. Fallback to JSON.")
            
    # Guardar en Fallback JSON
    db = load_fallback_db()
    db["users"] = [u for u in db["users"] if u["username"].lower() != username.lower()]
    db["playlists"] = [p for p in db["playlists"] if p["username"].lower() != username.lower()]
    save_fallback_db(db)
    
    return jsonify({"success": True, "message": "Cuenta eliminada con éxito"})

# Endpoint: Login de usuario
@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    
    if not username or not password:
        return jsonify({"success": False, "message": "Usuario y contraseña requeridos"}), 400
        
    user_found = False
    correct_password = False
    user_data = None
    
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                res = session.run("MATCH (u:Usuario {nombre: $name}) RETURN u.password AS pass, u.nombre AS name", name=username)
                records = list(res)
                if records:
                    user_found = True
                    correct_password = (records[0]["pass"] == password)
        except Exception as e:
            print(f"Neo4j login error: {e}. Fallback to JSON.")
            
    # Fallback / Confirmación JSON
    db = load_fallback_db()
    for u in db["users"]:
        if u["username"].lower() == username.lower():
            user_found = True
            correct_password = (u["password"] == password)
            user_data = u
            break
            
    if not user_found:
        return jsonify({"success": False, "message": "Usuario no encontrado"}), 404
    if not correct_password:
        return jsonify({"success": False, "message": "Contraseña de seguridad incorrecta"}), 401
        
    return jsonify({"success": True, "username": username})

# Endpoint: Obtener géneros, artistas y moods disponibles
@app.route('/api/preferences', methods=['GET'])
def api_get_preferences():
    db = load_fallback_db()
    return jsonify({
        "genres": db["genres"],
        "artists": db["artists"],
        "moods": db["moods"]
    })

# Endpoint: Buscar y agregar un nuevo género, artista o mood si no está en la base
@app.route('/api/preferences/add', methods=['POST'])
def api_add_preference():
    data = request.json
    pref_type = data.get("type") # "genre", "artist", "mood"
    name = data.get("name", "").strip()
    
    if not pref_type or not name:
        return jsonify({"success": False, "message": "Tipo y nombre requeridos"}), 400
        
    db = load_fallback_db()
    added = False
    
    if pref_type == "genre":
        # Normalizar primera letra mayúscula
        name = name.title()
        if name not in db["genres"]:
            db["genres"].append(name)
            added = True
            if NEO4J_ENABLED:
                try:
                    with driver.session() as session:
                        session.run("MERGE (:Genero {nombre: $name})", name=name)
                except Exception:
                    pass
    elif pref_type == "artist":
        name = name.title()
        # Verificar si existe
        exists = any(a["name"].lower() == name.lower() for a in db["artists"])
        if not exists:
            new_artist = {"name": name, "cover": "https://picsum.photos/300?100"}
            db["artists"].append(new_artist)
            added = True
            if NEO4J_ENABLED:
                try:
                    with driver.session() as session:
                        session.run("MERGE (:Artista {nombre: $name, cover: $cover})", 
                                    name=name, cover=new_artist["cover"])
                except Exception:
                    pass
    elif pref_type == "mood":
        name = name.title()
        exists = any(m["name"].lower() == name.lower() for m in db["moods"])
        if not exists:
            new_mood = {"name": name, "cover": "https://picsum.photos/500?100"}
            db["moods"].append(new_mood)
            added = True
            if NEO4J_ENABLED:
                try:
                    with driver.session() as session:
                        session.run("MERGE (:Mood {nombre: $name, cover: $cover})", 
                                    name=name, cover=new_mood["cover"])
                except Exception:
                    pass
                    
    save_fallback_db(db)
    return jsonify({"success": True, "added": added, "name": name})

# Endpoint: Guardar gustos iniciales del usuario
@app.route('/api/preferences/save', methods=['POST'])
def api_save_preferences():
    data = request.json
    username = data.get("username", "").strip()
    genres = data.get("genres", [])
    artists = data.get("artists", [])
    moods = data.get("moods", [])
    
    if not username:
        return jsonify({"success": False, "message": "Nombre de usuario requerido"}), 400
        
    # Guardar en Neo4j
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                # 1. Borrar relaciones anteriores del usuario
                session.run("MATCH (u:Usuario {nombre: $name})-[r:GUSTA_GENERO|GUSTA_ARTISTA|GUSTA_MOOD]->() DELETE r", name=username)
                
                # 2. Crear relaciones de Generos
                for g in genres:
                    session.run("""
                        MATCH (u:Usuario {nombre: $username})
                        MATCH (g:Genero {nombre: $genre})
                        MERGE (u)-[:GUSTA_GENERO]->(g)
                    """, username=username, genre=g)
                    
                # 3. Crear relaciones de Artistas
                for a in artists:
                    session.run("""
                        MATCH (u:Usuario {nombre: $username})
                        MATCH (art:Artista {nombre: $artist})
                        MERGE (u)-[:GUSTA_ARTISTA]->(art)
                    """, username=username, artist=a)
                    
                # 4. Crear relaciones de Moods
                for m in moods:
                    session.run("""
                        MATCH (u:Usuario {nombre: $username})
                        MATCH (mo:Mood {nombre: $mood})
                        MERGE (u)-[:GUSTA_MOOD]->(mo)
                    """, username=username, mood=m)
        except Exception as e:
            print(f"Neo4j save preferences error: {e}. Fallback to JSON.")
            
    # Guardar en Fallback JSON
    db = load_fallback_db()
    for u in db["users"]:
        if u["username"].lower() == username.lower():
            u["genres"] = genres
            u["artists"] = artists
            u["moods"] = moods
            break
    save_fallback_db(db)
    
    return jsonify({"success": True, "message": "Preferencias de algoritmo guardadas con exito"})

# Endpoint: Recomendaciones de canciones y de artistas
@app.route('/api/recommendations', methods=['GET'])
def api_get_recommendations():
    username = request.args.get("username", "").strip()
    if not username:
        return jsonify({"success": False, "message": "Usuario requerido"}), 400
        
    recommended_songs = []
    recommended_artists = []
    
    db = load_fallback_db()
    
    # Intentar obtener recomendaciones desde Neo4j
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                # 1. Canciones recomendadas por coincidencia de gustos
                song_res = session.run("""
                    MATCH (u:Usuario {nombre: $username})
                    MATCH (c:Cancion)
                    OPTIONAL MATCH (u)-[:GUSTA_GENERO]->(g:Genero)<-[:PERTENECE_A]-(c)
                    OPTIONAL MATCH (u)-[:GUSTA_ARTISTA]->(a:Artista)<-[:COMPUESTA_POR]-(c)
                    OPTIONAL MATCH (u)-[:GUSTA_MOOD]->(m:Mood)<-[:TIENE_MOOD]-(c)
                    WITH c, count(g) as pg, count(a) as pa, count(m) as pm
                    WITH c, (pg * 1 + pa * 3 + pm * 2) as score
                    WHERE score > 0
                    RETURN c.titulo AS title, c.artista AS artist, c.archivo AS file, c.cover AS cover, c.lyrics AS lyrics, score
                    ORDER BY score DESC
                    LIMIT 8
                """, username=username)
                
                for record in song_res:
                    recommended_songs.append({
                        "title": record["title"],
                        "artist": record["artist"],
                        "file": record["file"],
                        "cover": record["cover"],
                        "lyrics": record["lyrics"]
                    })
                    
                # 2. Artistas recomendados (aquellos que pertenecen a sus géneros preferidos, pero que no seleccionó antes)
                artist_res = session.run("""
                    MATCH (u:Usuario {nombre: $username})
                    MATCH (g:Genero)<-[:GUSTA_GENERO]-(u)
                    MATCH (g)<-[:PERTENECE_A]-(c:Cancion)-[:COMPUESTA_POR]->(a:Artista)
                    WHERE NOT (u)-[:GUSTA_ARTISTA]->(a)
                    RETURN DISTINCT a.nombre AS name, a.cover AS cover, count(c) as score
                    ORDER BY score DESC
                    LIMIT 4
                """, username=username)
                
                for record in artist_res:
                    recommended_artists.append({
                        "name": record["name"],
                        "cover": record["cover"]
                    })
        except Exception as e:
            print(f"Neo4j recommendations error: {e}. Fallback to JSON logic.")
            
    # Fallback JSON / Si la base Neo4j está vacía o arrojó 0 resultados (Cold Start)
    if not recommended_songs:
        # Obtener los gustos del usuario en JSON
        user_pref = None
        for u in db["users"]:
            if u["username"].lower() == username.lower():
                user_pref = u
                break
                
        if user_pref:
            user_genres = [g.lower() for g in user_pref.get("genres", [])]
            user_artists = [a.lower() for a in user_pref.get("artists", [])]
            user_moods = [m.lower() for m in user_pref.get("moods", [])]
            
            # Calcular relevancia para cada canción
            scored_songs = []
            for song in db["songs"]:
                score = 0
                if song["genre"].lower() in user_genres:
                    score += 1
                if song["artist"].lower() in user_artists:
                    score += 3
                if song["mood"].lower() in user_moods:
                    score += 2
                    
                if score > 0:
                    scored_songs.append((song, score))
                    
            # Ordenar por score decreciente
            scored_songs.sort(key=lambda x: x[1], reverse=True)
            recommended_songs = [item[0] for item in scored_songs[:8]]
            
            # Recomendar artistas de los géneros que le gustan, pero que no haya seleccionado
            artist_scores = {}
            for song in db["songs"]:
                if song["genre"].lower() in user_genres:
                    art_name = song["artist"]
                    if art_name.lower() not in user_artists:
                        artist_scores[art_name] = artist_scores.get(art_name, 0) + 1
                        
            sorted_artists = sorted(artist_scores.items(), key=lambda x: x[1], reverse=True)
            for art_name, _ in sorted_artists[:4]:
                # Buscar cover
                cover = "https://picsum.photos/300?80"
                for art_obj in db["artists"]:
                    if art_obj["name"].lower() == art_name.lower():
                        cover = art_obj["cover"]
                        break
                recommended_artists.append({
                    "name": art_name,
                    "cover": cover
                })
                
    # Fallback global si no hay gustos cargados en absoluto (Cold start fallback completo)
    if not recommended_songs:
        recommended_songs = db["songs"][:8]
        
    if not recommended_artists:
        recommended_artists = [a for a in db["artists"] if a["name"] not in ["Kavinsky", "Daft Punk"]][:4]
        
    return jsonify({
        "songs": recommended_songs,
        "artists": recommended_artists
    })

def get_semantic_recommendations(q_clean, songs):
    synonyms = {
        "melancolia": ["triste", "llorar", "soledad", "deprimido", "tristeza", "sad", "nostalgia", "recuerdo", "lluvia", "melancol", "llorando"],
        "ejercicio": ["ejercicio", "correr", "gym", "fuerza", "pesas", "entrenar", "deporte", "fitness", "entrenamiento"],
        "fiesta": ["fiesta", "bailar", "discoteca", "party", "reventon", "divertido", "farra", "rumba", "pista"],
        "estudio": ["estudio", "tarea", "concentracion", "leer", "escribir", "enfoque", "oficina", "focus"],
        "relajacion": ["dormir", "relajar", "calma", "paz", "zen", "descanso", "meditar", "relax", "tranquilo"],
        "pop": ["amor", "romance", "pareja", "corazon", "enamorado", "novio", "novia", "baladas"],
        "rock": ["guitarra", "bateria", "clasico", "rock", "metal", "pesado", "heavy", "metallica", "acdc", "queen"],
        "hip hop": ["rap", "calle", "rima", "urbano", "hiphop", "trap"],
        "reggaeton": ["baile", "perreo", "urbano", "caribe", "reggaeton", "latino", "bad bunny", "feid", "karol g", "lindos", "ojitos"],
        "electronica": ["futurista", "computadora", "robot", "sintetizador", "electronica", "techno", "rave"]
    }
    
    matched_category = None
    for category, keywords in synonyms.items():
        if any(kw in q_clean for kw in keywords):
            matched_category = category
            break
            
    results = []
    if matched_category:
        for song in songs:
            if song["mood"].lower() == matched_category or song["genre"].lower() == matched_category:
                results.append(song)
                
    if not results:
        target_titles = ["Ojitos Lindos", "Sweet Child O' Mine", "Blinding Lights", "Hello", "Do I Wanna Know?"]
        for song in songs:
            if song["title"] in target_titles:
                results.append(song)
        if not results:
            results = songs[:5]
            
    return results

# Endpoint: Búsqueda dinámica por título, artista, género o mood
@app.route('/api/search', methods=['GET'])
def api_search():
    q = request.args.get("q", "").strip().lower()
    db = load_fallback_db()
    
    if not q:
        # Retornar el catálogo completo
        return jsonify({"results": db["songs"]})
        
    results = []
    q_clean = remove_accents(q)
    
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                res = session.run("""
                    MATCH (c:Cancion)
                    WHERE toLower(c.titulo) CONTAINS $q
                       OR toLower(c.artista) CONTAINS $q
                       OR toLower(c.genero) CONTAINS $q
                       OR toLower(c.mood) CONTAINS $q
                    RETURN c.titulo AS title, c.artista AS artist, c.archivo AS file, c.cover AS cover, c.lyrics AS lyrics, c.lyricsTranslated AS lyricsTranslated
                """, q=q)
                for record in res:
                    results.append({
                        "title": record["title"],
                        "artist": record["artist"],
                        "file": record["file"],
                        "cover": record["cover"],
                        "lyrics": record["lyrics"],
                        "lyricsTranslated": record.get("lyricsTranslated", [])
                    })
        except Exception as e:
            print(f"Neo4j search error: {e}. Fallback to JSON.")
            
    # Fallback/Sincronización JSON
    is_semantic = False
    if not results:
        for song in db["songs"]:
            title_clean = remove_accents(song["title"].lower())
            artist_clean = remove_accents(song["artist"].lower())
            genre_clean = remove_accents(song["genre"].lower())
            mood_clean = remove_accents(song["mood"].lower())
            if (q_clean in title_clean or 
                q_clean in artist_clean or 
                q_clean in genre_clean or 
                q_clean in mood_clean):
                results.append(song)
        
        # Fallback semántico si sigue vacío
        if not results:
            results = get_semantic_recommendations(q_clean, db["songs"])
            is_semantic = True
                
    return jsonify({"results": results, "is_semantic": is_semantic})

# Endpoint: Obtener playlists de un usuario
@app.route('/api/library/playlists', methods=['GET'])
def api_get_playlists():
    username = request.args.get("username", "").strip()
    if not username:
        return jsonify({"success": False, "message": "Usuario requerido"}), 400
        
    playlists = []
    
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                res = session.run("""
                    MATCH (u:Usuario {nombre: $username})<-[:CREADA_POR]-(p:Playlist)
                    RETURN p.id AS id, p.name AS name
                """, username=username)
                for record in res:
                    playlists.append({
                        "id": record["id"],
                        "name": record["name"]
                    })
        except Exception as e:
            print(f"Neo4j get playlists error: {e}. Fallback to JSON.")
            
    # Fallback JSON
    if not playlists:
        db = load_fallback_db()
        for p in db["playlists"]:
            if p["username"].lower() == username.lower():
                playlists.append({
                    "id": p["id"],
                    "name": p["name"]
                })
                
    return jsonify({"playlists": playlists})

# Endpoint: Crear playlist
@app.route('/api/library/playlists/create', methods=['POST'])
def api_create_playlist():
    data = request.json
    username = data.get("username", "").strip()
    name = data.get("name", "").strip()
    
    if not username or not name:
        return jsonify({"success": False, "message": "Usuario y nombre de playlist requeridos"}), 400
        
    playlist_id = str(uuid.uuid4())
    
    # Guardar en Neo4j
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                session.run("""
                    MATCH (u:Usuario {nombre: $username})
                    CREATE (p:Playlist {id: $id, name: $name})
                    CREATE (p)-[:CREADA_POR]->(u)
                """, username=username, id=playlist_id, name=name)
        except Exception as e:
            print(f"Neo4j create playlist error: {e}. Fallback to JSON.")
            
    # Guardar en Fallback JSON
    db = load_fallback_db()
    db["playlists"].append({
        "id": playlist_id,
        "name": name,
        "username": username,
        "songs": []
    })
    save_fallback_db(db)
    
    return jsonify({"success": True, "id": playlist_id, "name": name})

# Endpoint: Agregar canción a playlist
@app.route('/api/library/playlists/add', methods=['POST'])
def api_add_to_playlist():
    data = request.json
    playlist_id = data.get("playlist_id", "").strip()
    song_title = data.get("song_title", "").strip()
    
    if not playlist_id or not song_title:
        return jsonify({"success": False, "message": "ID de playlist y titulo de cancion requeridos"}), 400
        
    # Guardar en Neo4j
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                session.run("""
                    MATCH (p:Playlist {id: $playlist_id})
                    MATCH (c:Cancion {titulo: $song_title})
                    MERGE (p)-[:CONTIENE]->(c)
                """, playlist_id=playlist_id, song_title=song_title)
        except Exception as e:
            print(f"Neo4j add to playlist error: {e}. Fallback to JSON.")
            
    # Guardar en Fallback JSON
    db = load_fallback_db()
    added = False
    for p in db["playlists"]:
        if p["id"] == playlist_id:
            if song_title not in p["songs"]:
                p["songs"].append(song_title)
                added = True
            break
            
    save_fallback_db(db)
    return jsonify({"success": True, "added": added})

# Endpoint: Obtener canciones de una playlist
@app.route('/api/library/playlists/<playlist_id>/songs', methods=['GET'])
def api_get_playlist_songs(playlist_id):
    songs = []
    
    if NEO4J_ENABLED:
        try:
            with driver.session() as session:
                res = session.run("""
                    MATCH (p:Playlist {id: $playlist_id})-[:CONTIENE]->(c:Cancion)
                    RETURN c.titulo AS title, c.artista AS artist, c.archivo AS file, c.cover AS cover, c.lyrics AS lyrics
                """, playlist_id=playlist_id)
                for record in res:
                    songs.append({
                        "title": record["title"],
                        "artist": record["artist"],
                        "file": record["file"],
                        "cover": record["cover"],
                        "lyrics": record["lyrics"]
                    })
        except Exception as e:
            print(f"Neo4j get playlist songs error: {e}. Fallback to JSON.")
            
    # Fallback JSON
    if not songs:
        db = load_fallback_db()
        song_titles = []
        playlist_name = ""
        for p in db["playlists"]:
            if p["id"] == playlist_id:
                song_titles = p["songs"]
                playlist_name = p["name"]
                break
                
        for title in song_titles:
            for s in db["songs"]:
                if s["title"].lower() == title.lower():
                    songs.append(s)
                    break
                    
    return jsonify({"songs": songs})

if __name__ == '__main__':
    print("🚀 Servidor VIBES levantando en puerto 5000...")
    print("🌐 Abre tu navegador en: http://localhost:5000")
    app.run(debug=True, port=5000)
