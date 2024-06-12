from flask import Flask, request, make_response, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

realm_id = os.getenv("KEYCLOAK_REALM")
client_id = os.getenv("KEYCLOAK_CLIENT_ID")
client_secret = os.getenv("KEYCLOAK_SECRET")
database_url = os.getenv("DATABASE_URL")

app = Flask(__name__)
CORS(app)

engine = create_engine(database_url)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class ClickCounter(Base):
    __tablename__ = 'click_counter'
    id = Column(Integer, primary_key=True, autoincrement=True)
    count = Column(Integer, default=0)

Base.metadata.create_all(engine)

@app.route("/validate", methods=["POST"])
def validate_token():
    data = request.json
    response = requests.post(
        f"http://localhost:8080/realms/{realm_id}/protocol/openid-connect/token/introspect",
        {"client_id": client_id, "client_secret": client_secret, "token": data["token"]}
    ).json()
    return make_response(response, 200)

@app.route("/increment", methods=["POST"])
def increment_counter():
    data = request.json
    token = data.get("token")
    response = requests.post(
        f"http://localhost:8080/realms/{realm_id}/protocol/openid-connect/token/introspect",
        {"client_id": client_id, "client_secret": client_secret, "token": token}
    ).json()

    if response.get("active"):
        session = Session()
        counter = session.query(ClickCounter).first()
        if counter is None:
            counter = ClickCounter(count=1)
            session.add(counter)
        else:
            counter.count += 1
        session.commit()
        session.close()
        return jsonify({"count": counter.count})
    else:
        return make_response({"error": "Invalid token"}, 401)

if __name__ == "__main__":
    app.run(port=5001, host="0.0.0.0", debug=True)
