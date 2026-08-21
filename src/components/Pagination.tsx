import { useState } from 'react'

interface PaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
const [activeJumpGap, setActiveJumpGap] = useState<number | null>(null)
const [jumpInput, setJumpInput] = useState<string>('')

const handleJump = () => {
    const target = Number(jumpInput)
    if (target >= 1 && target <= totalPages) onPageChange(target)
    setActiveJumpGap(null)
    setJumpInput('')
}

const pagesToShow = Array.from(new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))).sort((a, b) => a - b)

return (
    <div className="flex gap-2 items-center flex-wrap justify-center mt-6">
        <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="bg-gray-800 border border-gray-700 px-3 py-1 rounded disabled:opacity-30">Prev</button>
        {pagesToShow.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
                {i > 0 && p - pagesToShow[i - 1] > 1 && (
                    activeJumpGap === i ? (
                        <input
                            type="number"
                            autoFocus
                            value={jumpInput}
                            onChange={(e) => setJumpInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJump()}
                            onBlur={handleJump}
                            className="w-14 bg-gray-800 border border-gray-700 px-1 text-center"
                        />
                    ) : (
                        <button onClick={() => setActiveJumpGap(i)} className="px-2 text-gray-400">...</button>
                    )
                )}
                <button onClick={() => onPageChange(p)} className={`px-3 py-1 rounded border ${p === page ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-700'}`}>{p}</button>
            </span>
        ))}
        <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className="bg-gray-800 border border-gray-700 px-3 py-1 rounded disabled:opacity-30">Next</button>
    </div>
)
}

export default Pagination