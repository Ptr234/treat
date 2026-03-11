import { onRequest } from "firebase-functions/v2/https";
import { db } from "./admin";

export const tickets = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    try {
      switch (req.method) {
        case "GET": {
          // GET /tickets?status=NEW&priority=high
          const { status, priority, assignee, limit: limitStr } = req.query;
          let query: FirebaseFirestore.Query = db.collection("tickets")
            .orderBy("createdAt", "desc");

          if (status) query = query.where("status", "==", status);
          if (priority) query = query.where("priority", "==", priority);
          if (assignee) query = query.where("assignee", "==", assignee);

          const pageLimit = Math.min(parseInt(limitStr as string) || 50, 100);
          query = query.limit(pageLimit);

          const snapshot = await query.get();
          const ticketsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          res.json({ success: true, data: ticketsList, total: ticketsList.length });
          return;
        }

        case "POST": {
          // POST /tickets — create new ticket
          const {
            title,
            description,
            category,
            priority: ticketPriority,
            contactEmail,
            contactName,
          } = req.body;

          if (!title || !description || !category) {
            res.status(400).json({ error: "title, description, and category are required" });
            return;
          }

          const slaDeadlines: Record<string, number> = {
            general_inquiry: 24,
            procedure_query: 8,
            application_status: 4,
            license_delay: 2,
            complaint: 2,
            vip_investor: 1,
          };

          const slaHours = slaDeadlines[category] || 24;
          const now = new Date();
          const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000);

          const ticketData = {
            title,
            description,
            category,
            priority: ticketPriority || "medium",
            status: "NEW",
            contactEmail: contactEmail || "",
            contactName: contactName || "",
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            slaDeadline: slaDeadline.toISOString(),
            history: [
              {
                id: `hist-${Date.now()}`,
                timestamp: now.toISOString(),
                action: "Ticket Created",
                actor: "System",
                details: "Ticket created via OSC Digital Tool",
                status: "NEW",
              },
            ],
            attachments: [],
          };

          const docRef = await db.collection("tickets").add(ticketData);

          res.status(201).json({
            success: true,
            data: { id: docRef.id, ...ticketData },
          });
          return;
        }

        case "PUT": {
          // PUT /tickets — update ticket (expects id in body)
          const { id, ...updates } = req.body;
          if (!id) {
            res.status(400).json({ error: "Ticket id is required" });
            return;
          }

          const ticketRef = db.collection("tickets").doc(id);
          const ticketDoc = await ticketRef.get();

          if (!ticketDoc.exists) {
            res.status(404).json({ error: "Ticket not found" });
            return;
          }

          const updateData = {
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          await ticketRef.update(updateData);

          res.json({
            success: true,
            data: { id, ...ticketDoc.data(), ...updateData },
          });
          return;
        }

        default:
          res.status(405).json({ error: "Method not allowed" });
      }
    } catch (error) {
      console.error("Tickets error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
