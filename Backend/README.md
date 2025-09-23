# ChefMtaani Backend API

## Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a .env file with the required environment variables
4. Start MongoDB
5. Run the server: `npm run dev`

## Seeding Data
To seed chef data: `node utils/seeder.js`
To delete all data: `node utils/seeder.js -d`

## API Endpoints

### Authentication
* **POST /api/auth/register** - Register customer
* **POST /api/auth/login** - Login user
* **POST /api/auth/register-chef** - Register chef

### Chefs
* **GET /api/chefs** - Get all chefs (with filters)
* **GET /api/chefs/:id** - Get single chef
* **PUT /api/chefs/:id** - Update chef profile (Auth required)
* **GET /api/chefs/:id/availability** - Get chef availability

### Bookings
* **GET /api/bookings** - Get user's bookings (Auth required)
* **POST /api/bookings** - Create booking (Customer auth required)
* **PUT /api/bookings/:id/status** - Update booking status (Chef auth required)
* **POST /api/bookings/:id/review** - Add review (Customer auth required)

### Cuisines
* **GET /api/cuisines** - Get all cuisines with stats

### Contact
* **POST /api/contact** - Submit contact form

## Authentication
The API uses JWT tokens for authentication. Include the token in the Authorization header:
`Authorization: Bearer <token>`

## Error Handling
All errors follow the format:
```json
{
  "success": false,
  "error": "Error message"
}
