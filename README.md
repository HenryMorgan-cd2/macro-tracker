# Macro Tracker

A full-stack meal tracking application built with React, Vite, Emotion CSS, Go, and PostgreSQL.

## Features

- Track meals with multiple ingredients
- Each ingredient has nutritional information (carbs, fat, protein, kcal)
- Beautiful, modern UI with responsive design
- Full CRUD operations for meals
- Real-time nutritional calculations
- RESTful API backend

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Emotion** - CSS-in-JS styling
- **Modern CSS** - Grid, Flexbox, and responsive design

### Backend
- **Go 1.21+** - Server language
- **Gin** - Web framework
- **PostgreSQL** - Database
- **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- PostgreSQL 12+

## Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd macro-tracker
```

### 2. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE macro_tracker;
```

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend  # if you have a backend directory, or stay in root
```

2. Install Go dependencies:
```bash
go mod tidy
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your database credentials:
```env
DATABASE_URL=postgres://username:password@localhost:5432/macro_tracker?sslmode=disable
PORT=8080
```

5. Run the backend:
```bash
go run main.go
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

### Adding a Meal

1. Click the "Add New Meal" button
2. Enter the meal name and datetime
3. Add ingredients with their nutritional information:
   - Name
   - Carbs (g)
   - Fat (g)
   - Protein (g)
   - Calories (kcal)
4. Click "Add Meal" to save

### Viewing Meals

- All meals are displayed in chronological order
- Each meal shows:
  - Name and datetime
  - List of ingredients with nutritional info
  - Total nutritional values for the meal

### Editing Meals

1. Click the "Edit" button on any meal
2. Modify the meal details and ingredients
3. Click "Update Meal" to save changes

### Deleting Meals

1. Click the "Delete" button on any meal
2. Confirm the deletion

## API Endpoints

### Meals
- `GET /api/meals` - Get all meals
- `GET /api/meals/:id` - Get a specific meal
- `POST /api/meals` - Create a new meal
- `PUT /api/meals/:id` - Update a meal
- `DELETE /api/meals/:id` - Delete a meal

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `POST /api/ingredients` - Create a new ingredient

## Project Structure

```
macro-tracker/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── MealForm.tsx   # Meal form component
│   │   └── MealList.tsx   # Meal list component
│   ├── api.ts             # API functions
│   ├── types.ts           # TypeScript types
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── main.go                # Go backend server
├── go.mod                 # Go module file
├── package.json           # Node.js dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Development

### Frontend Development

The frontend uses Vite for fast development:
- Hot module replacement
- TypeScript support
- CSS-in-JS with Emotion
- Proxy configuration for API calls

### Backend Development

The backend uses Gin for routing and PostgreSQL for data storage:
- RESTful API design
- CORS enabled for frontend communication
- Automatic database table creation
- Transaction support for data integrity

## Deployment

### Frontend Deployment

Build the frontend for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Backend Deployment

Build the Go binary:
```bash
go build -o macro-tracker main.go
```

Run the binary:
```bash
./macro-tracker
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
