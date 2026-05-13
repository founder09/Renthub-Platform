git init
git reset
git remote remove origin
git remote add origin https://github.com/founder09/Renthub-Platform.git

# Commit 1
git add .gitignore README.md server/package.json server/package-lock.json client/package.json client/package-lock.json
git commit -m "chore: initialize project and dependencies for MERN stack"

# Commit 2
git add server/models/ server/config/
git commit -m "feat: design MongoDB schemas for Users, Listings, and Bookings"

# Commit 3
git add server/middlewares/ server/utils/ server/controllers/authController.js server/routes/auth.js
git commit -m "feat: implement JWT authentication and secure role-based middleware"

# Commit 4
git add server/controllers/listingController.js server/controllers/bookingController.js server/routes/listings.js server/routes/bookings.js server/server.js
git commit -m "feat: build RESTful endpoints for property listings and booking management"

# Commit 5
git add client/index.html client/vite.config.js client/src/main.jsx client/src/App.jsx client/src/context/ client/src/api/
git commit -m "feat: setup React frontend routing and global authentication context"

# Commit 6
git add client/src/components/ client/src/layouts/ client/src/index.css
git commit -m "design: create responsive UI component library and core layouts"

# Commit 7
git add client/src/pages/ListingIndex.jsx client/src/pages/ListingShow.jsx client/src/pages/Login.jsx client/src/pages/Signup.jsx
git commit -m "feat: implement property search interface and authentication pages"

# Commit 8
git add client/src/pages/dashboard/
git commit -m "feat: build distinct dashboard experiences for tenants, owners, and admins"

# Commit 9
git add server/config/cloudConfig.js server/controllers/adminController.js client/src/pages/ListingNew.jsx client/src/pages/ListingEdit.jsx
git commit -m "feat: integrate Cloudinary for media uploads and Mapbox for geolocation"

# Commit 10
git add .
git commit -m "feat: add analytics, AI integrations, and final UI polish"

# Branch & Push
git branch -M main
git push -u origin main --force
