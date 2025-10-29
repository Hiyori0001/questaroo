import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Info, Gamepad2 } from "lucide-react"; // Import Gamepad2 icon

const Index = () => {
  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <div className="text-center bg-white dark:bg-gray-700 p-10 rounded-lg shadow-xl max-w-2xl mx-auto animate-pop-in">
        <h1 className="text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">Welcome to Questaroo!</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          Your adventure begins here. Explore the world, complete quests, and create your own stories!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/location-quests">
            <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-transform hover:scale-105 active:scale-95">
              <MapPin className="h-5 w-5 mr-2" /> Start a Quest
            </Button>
          </Link>
          <Link to="/mini-games">
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-gray-600 transition-transform hover:scale-105 active:scale-95">
              <Gamepad2 className="h-5 w-5 mr-2" /> Play Mini-Games
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          <Link to="/about">
            <Button variant="link" className="text-blue-600 dark:text-blue-400 hover:underline transition-transform hover:scale-105 active:scale-95">
              <Info className="h-4 w-4 mr-2" /> Learn More About Questaroo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;