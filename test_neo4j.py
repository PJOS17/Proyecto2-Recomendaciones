# =============================================================================
# test_neo4j.py - Script de Prueba de Conexión a Neo4j
# =============================================================================
# PROPÓSITO: Verifica que la conexión a la base de datos Neo4j en la nube
# funcione correctamente antes de ejecutar el servidor Flask.
# FUNCIONA:
#   1. Define las credenciales de conexión (URI, usuario, contraseña)
#   2. Intenta conectar al servidor Neo4j usando el driver oficial
#   3. Ejecuta una consulta simple ("RETURN 'Connection Successful!'")
#   4. Muestra el resultado o el error de conexión
# USO: python test_neo4j.py
# REQUISITO: pip install neo4j
# =============================================================================

import sys                          # Módulo del sistema (no se usa directamente pero está importado por si se necesita)
from neo4j import GraphDatabase    # Driver oficial de Neo4j para Python - permite conectar y ejecutar consultas Cypher

# ---- CREDENCIALES DE CONEXIÓN ----
# URI del servidor Neo4j en la nube (protocolo neo4j+s indica conexión segura con SSL/TLS)
URI = "neo4j+s://d544acc5.databases.neo4j.io"
# Nombre de usuario para autenticación en la base de datos
USER = "d544acc5"
# Contraseña de autenticación (generada por Neo4j Aura)
PASSWORD = "3JdyXlKfIxftHD0U9-jMTni7_DWovV10M2TNscwVU1k"

try:
    print("Testing connection to Neo4j...")  # Mensaje informativo
    # Crea un driver de conexión a Neo4j con las credenciales proporcionadas
    # GraphDatabase.driver() establece un pool de conexiones reutilizables
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

    # Abre una sesión de trabajo con la base de datos
    # "with" asegura que la sesión se cierre correctamente al terminar
    with driver.session() as session:
        # Ejecuta una consulta Cypher simple que solo devuelve un string
        # Esto verifica que la conexión, autenticación y la base de datos están operativas
        result = session.run("RETURN 'Connection Successful!' as msg")
        # Itera sobre los registros devueltos (solo habrá uno)
        for record in result:
            print(record["msg"])  # Imprime: "Connection Successful!"

    # Cierra el driver y libera todas las conexiones del pool
    driver.close()
except Exception as e:
    # Si la conexión falla por cualquier motivo (credenciales incorrectas, servidor caído, etc.)
    print(f"Error: {e}")
