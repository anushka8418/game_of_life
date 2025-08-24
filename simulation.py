from backend.grid import Grid

class Simulation:
    def __init__(self, rows=20, cols=20):
        self.grid = Grid(rows, cols)

    def get_state(self):
        return self.grid.get_grid()

    def step(self):
        return self.grid.next_generation()
