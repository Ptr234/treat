import { onRequest } from "firebase-functions/v2/https";
import { db } from "./admin";

export const projects = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { sector, region, status, investmentRange, search, limit: limitStr } = req.query;
      let query: FirebaseFirestore.Query = db.collection("projects")
        .orderBy("investmentValue", "desc");

      if (sector) query = query.where("sector", "==", sector);
      if (region) query = query.where("region", "==", region);
      if (status) query = query.where("status", "==", status);

      const pageLimit = Math.min(parseInt(limitStr as string) || 100, 500);
      query = query.limit(pageLimit);

      const snapshot = await query.get();
      let projectsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Client-side filters for range and search (Firestore doesn't support these natively)
      if (investmentRange) {
        const [min, max] = (investmentRange as string).split("-").map(Number);
        projectsList = projectsList.filter((p: Record<string, unknown>) => {
          const val = p.investmentValue as number;
          return val >= (min || 0) && val <= (max || Infinity);
        });
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        projectsList = projectsList.filter((p: Record<string, unknown>) =>
          (p.name as string || "").toLowerCase().includes(searchLower) ||
          (p.company as string || "").toLowerCase().includes(searchLower) ||
          (p.sector as string || "").toLowerCase().includes(searchLower)
        );
      }

      res.json({
        success: true,
        data: projectsList,
        total: projectsList.length,
      });
    } catch (error) {
      console.error("Projects error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
