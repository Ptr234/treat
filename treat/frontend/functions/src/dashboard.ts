import { onRequest } from "firebase-functions/v2/https";
import { db } from "./admin";

export const dashboard = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      // Aggregate metrics from multiple collections
      const [ticketsSnap, eventsSnap, sessionsSnap] = await Promise.all([
        db.collection("tickets").get(),
        db.collection("events").where("status", "==", "upcoming").get(),
        db.collection("chat_sessions")
          .where("status", "==", "active")
          .orderBy("updatedAt", "desc")
          .limit(100)
          .get(),
      ]);

      const tickets = ticketsSnap.docs.map((d) => d.data());

      // Calculate metrics
      const newTickets = tickets.filter((t) => t.status === "NEW").length;
      const inProgress = tickets.filter((t) =>
        ["ASSIGNED", "IN_PROGRESS", "PENDING_EXTERNAL"].includes(t.status)
      ).length;
      const resolved = tickets.filter((t) =>
        ["RESOLVED", "CLOSED"].includes(t.status)
      ).length;

      // SLA compliance
      const now = new Date();
      const withSla = tickets.filter((t) => t.slaDeadline);
      const slaCompliant = withSla.filter((t) => {
        if (["RESOLVED", "CLOSED"].includes(t.status)) {
          return new Date(t.updatedAt) <= new Date(t.slaDeadline);
        }
        return now <= new Date(t.slaDeadline);
      });
      const slaCompliance = withSla.length > 0
        ? Math.round((slaCompliant.length / withSla.length) * 100)
        : 100;

      // Pipeline value from active tickets (simplified)
      const pipelineValue = tickets
        .filter((t) => !["RESOLVED", "CLOSED"].includes(t.status))
        .length * 500000; // Placeholder multiplier

      // Alerts — SLA breaches
      const alerts = tickets
        .filter((t) =>
          !["RESOLVED", "CLOSED"].includes(t.status) &&
          t.slaDeadline &&
          now > new Date(t.slaDeadline)
        )
        .slice(0, 10)
        .map((t) => ({
          id: `alert-${t.id || Date.now()}`,
          type: "sla_breach",
          severity: t.priority === "critical" ? "critical" : "high",
          title: `SLA Breach: ${t.title}`,
          message: `Ticket has exceeded SLA deadline`,
          timestamp: now.toISOString(),
          acknowledged: false,
          relatedTicketId: t.id,
        }));

      const metrics = {
        liveInquiries: sessionsSnap.size,
        activeCases: newTickets + inProgress,
        pendingApprovals: newTickets,
        pipelineValue,
        responseRate: tickets.length > 0
          ? Math.round((resolved / tickets.length) * 100)
          : 0,
        conversionRate: 0, // Requires analytics data
        slaCompliance,
        investorSatisfaction: 0, // Requires satisfaction data
        upcomingEvents: eventsSnap.size,
        totalTickets: tickets.length,
        resolvedTickets: resolved,
        alerts,
      };

      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
