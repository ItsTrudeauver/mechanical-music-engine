from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import Routes
from app.routes import session, flow

app = FastAPI(
    title="Mechanical Music Engine",
    description="Deterministic entropy-based music discovery",
    version="1.0.0"
)

# ---------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------
# This is crucial. It allows your Next.js frontend (port 3000)
# to talk to this Python backend (port 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Whitelist the frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# ROUTE REGISTRATION
# ---------------------------------------------------------
app.include_router(session.router, prefix="/api", tags=["Session"])
app.include_router(flow.router, prefix="/api", tags=["Flow"])

# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------
@app.get("/")
async def root():
    return {"status": "online", "system": "Mechanical Music Engine"}

if __name__ == "__main__":
    import uvicorn
    # Hot reload enabled for development
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)