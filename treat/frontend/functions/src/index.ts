// UIA OSC Digital Tool — Cloud Functions Entry Point

// Module 1: AI Chatbot (Gemini proxy)
export { chatbot } from "./chatbot";

// Auth triggers
export { onUserCreated } from "./triggers/onUserCreate";

// Module 4: Tickets
export { tickets } from "./tickets";

// Module 2: Events
export { events } from "./events";

// Module 6: Projects
export { projects } from "./projects";

// Module 7: DG Dashboard
export { dashboard } from "./dashboard";
