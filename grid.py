import random

class Grid:
    def __init__(self, rows=20, cols=20):
        self.rows = rows
        self.cols = cols
        self.grid = [[random.choice([0, 1]) for _ in range(cols)] for _ in range(rows)]

    def get_grid(self):
        return self.grid

    def count_neighbors(self, row, col):
        directions = [(-1, -1), (-1, 0), (-1, 1),
                      (0, -1),          (0, 1),
                      (1, -1),  (1, 0), (1, 1)]
        count = 0
        for dr, dc in directions:
            r, c = row + dr, col + dc
            if 0 <= r < self.rows and 0 <= c < self.cols:
                count += self.grid[r][c]
        return count

    def next_generation(self):
        new_grid = [[0 for _ in range(self.cols)] for _ in range(self.rows)]

        for r in range(self.rows):
            for c in range(self.cols):
                neighbors = self.count_neighbors(r, c)
                if self.grid[r][c] == 1:  # alive
                    if neighbors in [2, 3]:
                        new_grid[r][c] = 1
                else:  # dead
                    if neighbors == 3:
                        new_grid[r][c] = 1

        self.grid = new_grid
        return self.grid
