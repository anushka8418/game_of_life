from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.simulation import Simulation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulation = Simulation(rows=20, cols=20)

@app.get("/state")
def get_state():
    return {"grid": simulation.get_state()}

@app.post("/step")
def next_step():
    return {"grid": simulation.step()}
