from backend.db import db


def main() -> None:
    result = db.test.insert_one({"msg": "Hello Mongo"})
    print("Inserted:", result.inserted_id)


if __name__ == "__main__":
    main()
