const NotFound = () => {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex items-center gap-4 text-white">
                <span className="font-bold text-2xl">404</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-300">This page could not be found</span>
            </div>
        </div>
    )
}

export default NotFound