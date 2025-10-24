import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <div className="text-center bg-white dark:bg-gray-700 p-10 rounded-lg shadow-xl max-w-lg mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">Welcome to Your Plot Twist App</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          Start building your amazing project here!
        </p>
        <Link to="/story-generator">
          <Button size="lg" className="px-8 py-4 text-lg font-semibold">
            Go to Story Generator
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;