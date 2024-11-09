import { Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center text-sm text-gray-600">
          Made with <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" /> by{' '}
          <a 
            href="https://www.linkedin.com/in/benjaminlang86/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-1 hover:text-gray-900 underline"
          >
            Ben
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer 