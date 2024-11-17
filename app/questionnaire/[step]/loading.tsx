export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
      <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
      
      <div className="bg-white bg-opacity-40 p-8 rounded-lg shadow-lg max-w-2xl w-full border border-white backdrop-blur-md relative z-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="snowflake-spinner">
            <div className="snowflake-inner">❄</div>
            <div className="snowflake-glow"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 