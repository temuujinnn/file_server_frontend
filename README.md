# GameHub - Software & Games Store Frontend

A modern, minimalist React frontend for a software and game-selling website with dark theme and tag-based filtering.

## Features

- 🎨 **Modern Dark Theme**: Clean, minimalist design with electric blue accents
- 🏷️ **Tag-based Filtering**: Filter products by categories/tags
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🔐 **User Authentication**: Login and registration pages
- ⚡ **Fast Performance**: Built with Vite for optimal development and build performance
- 🎯 **API Integration**: Connects to backend API at `http://202.180.218.186:9000`

## Tech Stack

- **React 18** with Vite
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Inter/Poppins** fonts

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx          # Navigation header
│   ├── ProductCard.tsx     # Individual product card
│   ├── ProductGrid.tsx     # Grid of product cards
│   └── TagSidebar.tsx      # Category/tag filter sidebar
├── pages/
│   ├── HomePage.tsx        # Main page with products and filters
│   ├── LoginPage.tsx       # User login form
│   └── RegisterPage.tsx    # User registration form
├── services/
│   └── api.ts              # API service functions
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Main app component with routing
├── main.tsx               # React entry point
└── index.css              # Global styles and Tailwind imports
```

## API Endpoints

The frontend connects to the following backend endpoints:

- `GET /user/game/all` - Fetch all products
- `GET /user/game/additional_tags` - Fetch available tags for filtering
- `GET /user/game/games/additional_tag?additionalTag={tag_id}` - Filter products by tag
- `POST /userAuth/login` - User login
- `POST /userAuth/register` - User registration

## Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Usage

1. **Make sure your backend server** is running on `http://202.180.218.186:9000`
2. **Run the frontend** with `npm run dev`
3. **Open your browser** to `http://localhost:5173`

## Key Features

### Product Browsing

- View all products in a responsive grid layout
- Filter products by mainTag (Games/Software) using the sidebar
- Expand Games section to see additional tags (like RPG)
- Filter products by additional categories/tags using the sidebar
- Clear filters to return to all products
- Click on any product card to view detailed information
- Download products directly from the detail modal

### User Authentication

- Register new accounts with username and password
- Login with existing credentials
- JWT token-based authentication
- Automatic token storage and management
- Protected API requests with Bearer tokens
- User session persistence across browser refreshes
- Logout functionality with token cleanup
- Form validation and error handling

### Responsive Design

- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly interface

## Customization

### Colors

The app uses a dark theme with electric blue (`#3b82f6`) accents. You can customize colors in:

- `tailwind.config.js` - Define custom colors
- `src/index.css` - CSS custom properties and component classes

### Fonts

The app uses Inter and Poppins fonts. You can change fonts in:

- `index.html` - Google Fonts links
- `tailwind.config.js` - Font family configuration

## Development

The project uses ESLint for code quality. Run linting with:

```bash
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is created for educational and development purposes.
# file_server_frontend
