import random

class Tetrimino:
    def __init__(self, width, color, start_x, start_y, positions):
        # Validation pour start_x et start_y pour être des entiers
        if not isinstance(start_x, int) or not isinstance(start_y, int):
            raise ValueError("start_x and start_y must be integers")
        
        self.width = width
        self.color = color  # Couleur en format hexadécimal
        self.start = {'x': start_x, 'y': start_y}
        self.positions = positions  # Matrice de positions avec des couleurs en hexadécimal

    def __repr__(self):
        return f"(width={self.width}, color={self.color}, start={self.start})"
    
    def to_dict(self):
        return {
            'width': self.width,
            'color': self.color,
            'start': self.start,
            'positions': self.positions
        }

class TetriminoI(Tetrimino):
    def __init__(self):
        positions = [['#FFFFFF' for _ in range(4)] for _ in range(4)]
        for i in range(4):
            positions[i][1] = '#0000FF'  # Couleur bleue en hexadécimal
        super().__init__(4, '#0000FF', 3, 0, positions)

class TetriminoO(Tetrimino):
    def __init__(self):
        positions = [['#FFFFFF' for _ in range(4)] for _ in range(4)]
        positions[1][1] = '#FFD700'  # Couleur dorée en hexadécimal
        positions[2][1] = '#FFD700'
        positions[1][2] = '#FFD700'
        positions[2][2] = '#FFD700'
        super().__init__(4, '#FFD700', 4, 0, positions)

class TetriminoT(Tetrimino):
    def __init__(self):
        positions = [['#FFFFFF' for _ in range(3)] for _ in range(3)]
        positions[0][1] = '#FF0000'  # Couleur rouge en hexadécimal
        positions[1][0] = '#FF0000'
        positions[1][1] = '#FF0000'
        positions[1][2] = '#FF0000'
        super().__init__(3, '#FF0000', 4, 0, positions)

class TetriminoL(Tetrimino):
    def __init__(self):
        positions = [['#FFFFFF' for _ in range(3)] for _ in range(3)]
        positions[0][0] = '#7F00FF'  # Couleur pourpre en hexadécimal
        positions[0][1] = '#7F00FF'
        positions[1][1] = '#7F00FF'
        positions[2][1] = '#7F00FF'
        super().__init__(3, '#7F00FF', 4, 0, positions)

class TetriminoJ(Tetrimino):
    def __init__(self):
        positions = [['#FFFFFF' for _ in range(3)] for _ in range(3)]
        positions[0][1] = '#00FF00'  # Couleur verte en hexadécimal
        positions[0][2] = '#00FF00'
        positions[1][1] = '#00FF00'
        positions[2][1] = '#00FF00'
        super().__init__(3, '#00FF00', 4, 0, positions)

class TetriminoS(Tetrimino):
    def __init__(self):
        positions = [['#FFFFFF' for _ in range(3)] for _ in range(3)]
        positions[0][1] = '#ED7F10'  # Couleur orange en hexadécimal
        positions[1][0] = '#ED7F10'
        positions[1][1] = '#ED7F10'
        positions[2][0] = '#ED7F10'
        super().__init__(3, '#ED7F10', 4, 0, positions)

class TetriminoZ(Tetrimino):
    def __init__(self):
        positions = [['#FFFFFF' for _ in range(3)] for _ in range(3)]
        positions[0][0] = '#808080'  # Couleur grise en hexadécimal
        positions[1][0] = '#808080'
        positions[1][1] = '#808080'
        positions[2][1] = '#808080'
        super().__init__(3, '#808080', 4, 0, positions)

def get_next_piece():
    tetriminos = [TetriminoI, TetriminoO, TetriminoT, TetriminoL, TetriminoJ, TetriminoS, TetriminoZ]
    return random.choice(tetriminos)()

def custom_serializer(obj):
    if isinstance(obj, Tetrimino):
        return obj.to_dict()
    raise TypeError(f"Type {type(obj)} not serializable")

# Example usage
next_piece = get_next_piece()
# print(next_piece)
# print(next_piece.positions)


def check_pos(positions, newpos, game_map):
    error = False
    num_rows = len(positions)
    num_cols = len(positions[0]) if num_rows > 0 else 0
    for i in range(num_rows):
        for j in range(num_cols):
            if positions[i][j] != "#FFFFFF":
                if (newpos['y'] + i > 19 or
                    newpos['x'] + j >= 10 or
                    newpos['x'] + j < 0 or
                    game_map[newpos['y'] + i][newpos['x'] + j] != "#FFFFFF"):
                    error = True
    return error



def rotate_piece(self, direction):
    print("je passe une fois par ici")
    newpos = [[None] * len(self.current_piece.positions) for _ in range(self.current_piece.width)]
    if direction == 'PressArrowUp':
        print("on est ici")
        col = self.current_piece.width - 1
        for i in range(len(self.current_piece.positions)):
            for j in range(len(self.current_piece.positions[i])):
                newpos[i][j] = self.current_piece.positions[j][col]
            col -= 1
    else:
        print("on est dams le else")
        for i in range(len(self.current_piece.positions)):
            for j in range(len(self.current_piece.positions[i])):
                newpos[i][j] = self.current_piece.positions[j][i]
    if not check_pos(newpos, self.current_piece.start, self.map):
        self.current_piece.positions = newpos

def removeLine(map,self):
    i = 0
    value = '#FFFFFF'
    while i < len(map):
        if all(cell != value for cell in map[i]):
            map.pop(i)
        else:
            i += 1
    lines_removed = 20 - len(map)
    if lines_removed > 0:
        print(f'{self.nb}//////////////////////{lines_removed} ont ete enlevee/////////////////////')
    if lines_removed > 0:
        new_lines = [[value] * len(map[0]) for _ in range(lines_removed)]
        map[:0] = new_lines
    return lines_removed

def add_in_map(piece, game_map,self):
    start_x = piece.start['x']
    start_y = piece.start['y']
    for i in range(len(piece.positions)):
        for j in range(len(piece.positions[i])):
            map_x = start_x + j
            map_y = start_y + i
            if (0 <= map_y < len(game_map) and
                0 <= map_x < len(game_map[0])):            
                if piece.positions[i][j] != "#FFFFFF":
                    game_map[map_y][map_x] = piece.color
    return removeLine(game_map,self)

def lateralMove(dir, map, currentPiece):
    new_x = currentPiece.start['x'] + dir
    new_pos = {'x': new_x, 'y': currentPiece.start['y']}
    error = check_pos(currentPiece.positions, new_pos, map)
    if not error:
        currentPiece.start = new_pos

def drop_piece(self):
    new_pos = {'x': self.current_piece.start['x'], 'y': self.current_piece.start['y'] + 1}
    if check_pos(self.current_piece.positions, new_pos, self.map):
        self.lineToSend = add_in_map(self.current_piece, self.map, self)
        self.currentDropSpeed = self.dropSpeed
        self.event.clear()
        self.current_piece = self.next_piece
        self.next_piece = get_next_piece()
        return False
    else:
        self.current_piece.start = new_pos
        return True

def add_line(self):
    random_index = -1
    while True:
        random_index = random.randint(0, 9)
        if random_index != self.oldRand:
            break
    self.oldRand = random_index
    print(f'dans add line consummer {self.nb} doitt ajouter {self.lineToAdd}')
    del self.map[:self.lineToAdd]
    new_lines = [['#000000'] * 10 for _ in range(self.lineToAdd)]
    self.map += new_lines
    for line in new_lines:
        line[random_index] = '#FFFFFF'

