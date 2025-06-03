from db.models.model_owner import Owner, GenderEnum as OwnerGenderEnum
from db.database import SessionLocal
from datetime import date

extended_mock_owner_data = [
    {
        "owner_ic_no": "800101-01-0001",
        "first_name": "Ravi",
        "last_name": "Kumar",
        "email": "ravi.kumar@example.com",
        "date_of_birth": date(1980, 1, 1),
        "gender": OwnerGenderEnum.male,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "830203-02-0002",
        "first_name": "Lim",
        "last_name": "Bee Leng",
        "email": "lim.beeleng@example.com",
        "date_of_birth": date(1983, 2, 3),
        "gender": OwnerGenderEnum.female,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "840404-03-0003",
        "first_name": "Zainab",
        "last_name": "Abdullah",
        "email": "zainab.abdullah@example.com",
        "date_of_birth": date(1984, 4, 4),
        "gender": OwnerGenderEnum.female,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "851212-04-0004",
        "first_name": "Ganesh",
        "last_name": "Raj",
        "email": "ganesh.raj@example.com",
        "date_of_birth": date(1985, 12, 12),
        "gender": OwnerGenderEnum.male,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "870707-05-0005",
        "first_name": "Aida",
        "last_name": "Yusof",
        "email": "aida.yusof@example.com",
        "date_of_birth": date(1987, 7, 7),
        "gender": OwnerGenderEnum.female,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "880808-06-0006",
        "first_name": "Faiz",
        "last_name": "Rahman",
        "email": "faiz.rahman@example.com",
        "date_of_birth": date(1988, 8, 8),
        "gender": OwnerGenderEnum.male,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "890909-07-0007",
        "first_name": "Kavitha",
        "last_name": "Selvam",
        "email": "kavitha.selvam@example.com",
        "date_of_birth": date(1989, 9, 9),
        "gender": OwnerGenderEnum.female,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "900101-08-0008",
        "first_name": "Daniel",
        "last_name": "Lee",
        "email": "daniel.lee@example.com",
        "date_of_birth": date(1990, 1, 1),
        "gender": OwnerGenderEnum.male,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "910202-09-0009",
        "first_name": "Farah",
        "last_name": "Bakar",
        "email": "farah.bakar@example.com",
        "date_of_birth": date(1991, 2, 2),
        "gender": OwnerGenderEnum.female,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "930303-10-0010",
        "first_name": "Hassan",
        "last_name": "Iskandar",
        "email": "hassan.iskandar@example.com",
        "date_of_birth": date(1993, 3, 3),
        "gender": OwnerGenderEnum.male,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "940404-11-0011",
        "first_name": "Mei",
        "last_name": "Chen",
        "email": "mei.chen@example.com",
        "date_of_birth": date(1994, 4, 4),
        "gender": OwnerGenderEnum.female,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "950505-12-0012",
        "first_name": "Imran",
        "last_name": "Syed",
        "email": "imran.syed@example.com",
        "date_of_birth": date(1995, 5, 5),
        "gender": OwnerGenderEnum.male,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "960606-13-0013",
        "first_name": "Anis",
        "last_name": "Halim",
        "email": "anis.halim@example.com",
        "date_of_birth": date(1996, 6, 6),
        "gender": OwnerGenderEnum.female,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "970707-14-0014",
        "first_name": "Kelvin",
        "last_name": "Tan",
        "email": "kelvin.tan@example.com",
        "date_of_birth": date(1997, 7, 7),
        "gender": OwnerGenderEnum.male,
        "nationality": "Malaysian"
    },
    {
        "owner_ic_no": "980808-15-0015",
        "first_name": "Rohana",
        "last_name": "Salleh",
        "email": "rohana.salleh@example.com",
        "date_of_birth": date(1998, 8, 8),
        "gender": OwnerGenderEnum.female,
        "nationality": "Malaysian"
    }
]

def seed_owners():
    db = SessionLocal()
    try:
        for data in extended_mock_owner_data:
            if db.query(Owner).filter_by(email=data["email"]).first():
                print(f"Skipping {data['email']} - already exists")
                continue
            owner = Owner(
                owner_ic_no=data["owner_ic_no"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                date_of_birth=data["date_of_birth"],
                gender=data["gender"],
                nationality=data["nationality"]
            )
            db.add(owner)
            print(f"✅ Added owner: {data['email']}")
        db.commit()
        print("✅ Seeded owner data successfully.")
    except Exception as e:
        db.rollback()
        print("❌ Error seeding owner data:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_owners()
