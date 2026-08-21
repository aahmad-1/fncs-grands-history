interface SkeletonProps {
    className?: string
}

const Skeleton = ({ className = '' }: SkeletonProps) => (
    <div className={`bg-gray-700 animate-pulse rounded ${className}`} />
)

export default Skeleton