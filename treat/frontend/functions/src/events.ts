import { onRequest } from "firebase-functions/v2/https";
import { db } from "./admin";

export const events = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    try {
      switch (req.method) {
        case "GET": {
          const { category, status, limit: limitStr } = req.query;
          let query: FirebaseFirestore.Query = db.collection("events")
            .orderBy("date", "desc");

          if (category) query = query.where("category", "==", category);
          if (status) query = query.where("status", "==", status);

          const pageLimit = Math.min(parseInt(limitStr as string) || 50, 100);
          query = query.limit(pageLimit);

          const snapshot = await query.get();
          const eventsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          res.json({ success: true, data: eventsList });
          return;
        }

        case "POST": {
          // Check if this is an event registration or event creation
          const { action } = req.body;

          if (action === "register") {
            // Event registration
            const { eventId, name, email, phone, organization } = req.body;

            if (!eventId || !name || !email) {
              res.status(400).json({ error: "eventId, name, and email are required" });
              return;
            }

            const eventRef = db.collection("events").doc(eventId);
            const eventDoc = await eventRef.get();

            if (!eventDoc.exists) {
              res.status(404).json({ error: "Event not found" });
              return;
            }

            const eventData = eventDoc.data()!;
            if (eventData.registered >= eventData.capacity) {
              res.status(400).json({ error: "Event is at full capacity" });
              return;
            }

            const registration = {
              eventId,
              name,
              email,
              phone: phone || "",
              organization: organization || "",
              registeredAt: new Date().toISOString(),
            };

            await db.collection("event_registrations").add(registration);
            await eventRef.update({
              registered: (eventData.registered || 0) + 1,
            });

            res.status(201).json({ success: true, data: registration });
            return;
          }

          // Create new event
          const {
            title, description, eventCategory, date, endDate,
            time, location, isVirtual, virtualLink,
            registrationDeadline, capacity, speakers,
            resources, imageUrl, organizer,
          } = req.body;

          if (!title || !date || !location) {
            res.status(400).json({ error: "title, date, and location are required" });
            return;
          }

          const newEvent = {
            title,
            description: description || "",
            category: eventCategory || "forum",
            date,
            endDate: endDate || null,
            time: time || "",
            location,
            isVirtual: isVirtual || false,
            virtualLink: virtualLink || null,
            registrationDeadline: registrationDeadline || date,
            capacity: capacity || 100,
            registered: 0,
            speakers: speakers || [],
            resources: resources || [],
            status: "upcoming",
            imageUrl: imageUrl || null,
            organizer: organizer || "Uganda Investment Authority",
            createdAt: new Date().toISOString(),
          };

          const docRef = await db.collection("events").add(newEvent);
          res.status(201).json({ success: true, data: { id: docRef.id, ...newEvent } });
          return;
        }

        default:
          res.status(405).json({ error: "Method not allowed" });
      }
    } catch (error) {
      console.error("Events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
