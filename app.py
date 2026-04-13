from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import os

app = Flask(__name__)
CORS(app)  # Permite o HTML acessar o backend

# Caminho do banco de dados (na mesma pasta)
DB_PATH = os.path.join(os.path.dirname(__file__), "banco_a3.db")


def get_db():
    """Abre conexão com o banco SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Cria as tabelas se ainda não existirem."""
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            nome      TEXT    NOT NULL,
            email     TEXT    NOT NULL UNIQUE,
            usuario   TEXT    NOT NULL UNIQUE,
            senha     TEXT    NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Cria usuário padrão "adm/123" se não existir
    senha_adm = hashlib.sha256("123".encode()).hexdigest()
    conn.execute("""
        INSERT OR IGNORE INTO usuarios (nome, email, usuario, senha)
        VALUES ('Administrador', 'adm@atmos.com', 'adm', ?)
    """, (senha_adm,))
    conn.commit()
    conn.close()
    print("✅ Banco de dados pronto:", DB_PATH)


@app.route("/login", methods=["POST"])
def login():
    """Autentica um usuário."""
    data = request.get_json()
    usuario = data.get("usuario", "").strip()
    senha   = data.get("senha", "").strip()

    if not usuario or not senha:
        return jsonify({"ok": False, "erro": "Preencha todos os campos."}), 400

    senha_hash = hashlib.sha256(senha.encode()).hexdigest()

    conn = get_db()
    row = conn.execute(
        "SELECT nome FROM usuarios WHERE (usuario = ? OR email = ?) AND senha = ?",
        (usuario, usuario, senha_hash)
    ).fetchone()
    conn.close()

    if row:
        return jsonify({"ok": True, "nome": row["nome"]})
    else:
        return jsonify({"ok": False, "erro": "Usuário ou senha incorretos."}), 401


@app.route("/cadastro", methods=["POST"])
def cadastro():
    """Cadastra um novo usuário."""
    data    = request.get_json()
    nome    = data.get("nome", "").strip()
    email   = data.get("email", "").strip()
    usuario = data.get("usuario", "").strip()
    senha   = data.get("senha", "").strip()

    if not all([nome, email, usuario, senha]):
        return jsonify({"ok": False, "erro": "Preencha todos os campos."}), 400

    if len(senha) < 6:
        return jsonify({"ok": False, "erro": "Senha deve ter no mínimo 6 caracteres."}), 400

    senha_hash = hashlib.sha256(senha.encode()).hexdigest()

    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO usuarios (nome, email, usuario, senha) VALUES (?, ?, ?, ?)",
            (nome, email, usuario, senha_hash)
        )
        conn.commit()
        conn.close()
        return jsonify({"ok": True, "nome": nome})
    except sqlite3.IntegrityError as e:
        if "email" in str(e):
            return jsonify({"ok": False, "erro": "Este e-mail já está cadastrado."}), 409
        if "usuario" in str(e):
            return jsonify({"ok": False, "erro": "Este nome de usuário já está em uso."}), 409
        return jsonify({"ok": False, "erro": "Erro ao cadastrar."}), 500


@app.route("/usuarios", methods=["GET"])
def listar_usuarios():
    """Lista todos os usuários (sem senha)."""
    conn = get_db()
    rows = conn.execute(
        "SELECT id, nome, email, usuario, criado_em FROM usuarios ORDER BY criado_em DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


if __name__ == "__main__":
    init_db()
    print("🚀 Servidor rodando em http://localhost:5000")
    app.run(debug=True, port=5000)
