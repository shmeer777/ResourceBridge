"""
Optional seed script to populate sample demo data for hackathon demonstrations.
Run with:
    python seed.py
"""
from datetime import datetime, timezone
from app.db.session import SessionLocal, init_db
from app.models.user import User
from app.models.organization import Organization
from app.models.resource import Resource
from app.core.security import hash_password

def seed():
    init_db()
    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(User).filter(User.email == "provider@demo.com").first()
        if existing:
            print("Demo accounts already exist. Skipping seed.")
            return

        print("Seeding demo accounts and resources...")

        # 1. Provider
        provider = User(
            email="provider@demo.com",
            full_name="Dr. Elena Rostova",
            hashed_password=hash_password("DemoPassword123!"),
            role="provider",
            organization_name="BioFab Innovations Lab",
            organization_type="Research Laboratory",
            is_active=True
        )
        db.add(provider)
        db.commit()
        db.refresh(provider)

        org = Organization(
            name="BioFab Innovations Lab",
            organization_type="Research Laboratory",
            description="Advanced prototyping and biomedical fabrication center.",
            owner_id=provider.id
        )
        db.add(org)

        # 2. Seeker
        seeker = User(
            email="seeker@demo.com",
            full_name="Marcus Vance",
            hashed_password=hash_password("DemoPassword123!"),
            role="seeker",
            organization_name="Quantum Bio Devices",
            is_active=True
        )
        db.add(seeker)
        db.commit()

        # 3. Resources
        r1 = Resource(
            owner_id=provider.id,
            title="Stratasys F370 Industrial 3D Printer",
            description="Professional multi-material rapid prototyping 3D printer supporting ABS-M30, ASA, and TPU 92A elastomer.",
            category="Equipment",
            location="Building 4, Prototyping Bay 102",
            capacity=1,
            hourly_rate=35.0,
            eligibility_criteria="Level 1 Additive Manufacturing Induction completed",
            rules="Ensure heated build chamber is cool before part extraction. Clean print bed with isopropyl alcohol."
        )

        r2 = Resource(
            owner_id=provider.id,
            title="Nikon Confocal Laser Microscope",
            description="High-resolution inverted microscope equipped with 4 laser lines for live multi-channel fluorescence imaging.",
            category="Lab Facility",
            location="Microscopy Suite, Room 310",
            capacity=2,
            hourly_rate=60.0,
            eligibility_criteria="Biosafety Level 2 training certification required",
            rules="Wear protective eyewear. Clean 60x oil immersion objective immediately after session."
        )

        r3 = Resource(
            owner_id=provider.id,
            title="Keysight 4-Channel Mixed Signal Oscilloscope Bench",
            description="Equipped with 500 MHz oscilloscope, dual programmable DC power supplies, function generator, and soldering station.",
            category="Tools & Machinery",
            location="Hardware Engineering Lab, Station 7",
            capacity=2,
            hourly_rate=20.0,
            eligibility_criteria="Basic electrical safety orientation",
            rules="Turn off soldering irons and power supplies before leaving bench."
        )

        db.add_all([r1, r2, r3])
        db.commit()

        print("Database successfully seeded with demo accounts and resources:")
        print("  - Provider: provider@demo.com / DemoPassword123!")
        print("  - Seeker:   seeker@demo.com   / DemoPassword123!")
        print("  - 3 Shared Resources ready to browse and book!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

