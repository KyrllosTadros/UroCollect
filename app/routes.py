from flask import Blueprint, request, redirect, jsonify
from db import supabase

main = Blueprint("main", __name__)

# --------------------
# READ (alle todos)
# --------------------
@main.route("/")
def get_todos():
    response = supabase.table("todos").select("*").execute()
    return jsonify(response.data)


# --------------------
# CREATE (todo toevoegen)
# --------------------
@main.route("/add", methods=["POST"])
def add_todo():
    data = request.json

    supabase.table("todos").insert({
        "name": data["name"]
    }).execute()

    return {"message": "Todo added"}


# --------------------
# UPDATE (todo aanpassen)
# --------------------
@main.route("/update/<id>", methods=["PUT"])
def update_todo(id):
    data = request.json

    supabase.table("todos").update({
        "name": data["name"]
    }).eq("id", id).execute()

    return {"message": "Todo updated"}


# --------------------
# DELETE (todo verwijderen)
# --------------------
@main.route("/delete/<id>", methods=["DELETE"])
def delete_todo(id):
    supabase.table("todos").delete().eq("id", id).execute()

    return {"message": "Todo deleted"}