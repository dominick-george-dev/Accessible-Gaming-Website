import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <h1>Welcome to Accessible Gaming Website</h1>
      <p>This is a placeholder for your Figma-designed homepage.</p>
      <div className="mt-8">
        <Link 
          to="/profile" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Profile Page (Figma Component)
        </Link>
      </div>
      {/* Replace this content with your Figma components */}
    </div>
  );
};

export default HomePage;
