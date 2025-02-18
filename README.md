# Plan

* Update backend database to allow User->Recipe relationship
* When a recipe is created, set the authenticated user as its owner
* All recipe endpoints should require authentication and should only return bonchef recipes _or_ the logged in users own recipes
* Implement supabase authentication in create prototype
* Do authenticated fetch call to create recipe