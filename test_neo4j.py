import sys
from neo4j import GraphDatabase

URI = "neo4j+s://d544acc5.databases.neo4j.io"
USER = "d544acc5"
PASSWORD = "3JdyXlKfIxftHD0U9-jMTni7_DWovV10M2TNscwVU1k"

try:
    print("Testing connection to Neo4j...")
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    with driver.session() as session:
        result = session.run("RETURN 'Connection Successful!' as msg")
        for record in result:
            print(record["msg"])
    driver.close()
except Exception as e:
    print(f"Error: {e}")
