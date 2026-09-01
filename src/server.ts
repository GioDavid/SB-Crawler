import express, {
    type Request,
    type Response,
  } from "express";
  
  import { entriesRouter } from "./routes/entries-route.js";
  
  interface HealthResponse {
    status: "ok";
  }
  
  const app = express();
  
  const PORT: number = 3000;
  
  app.use(express.json());
  
  app.get(
    "/health",
    (_req: Request, res: Response<HealthResponse>) => {
      return res.status(200).json({
        status: "ok",
      });
    },
  );
  
  app.use("/entries", entriesRouter);
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });